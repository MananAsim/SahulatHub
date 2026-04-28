const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// ── CSV Dataset path (relative to backend root) ──────────────────────────────
const CSV_PATH = path.resolve(__dirname, '../../sahulathub-ai/final dataset for FYP.csv');

// ── Haversine distance (km) ───────────────────────────────────────────────────
const _toRad = (deg) => (deg * Math.PI) / 180;
const _haversineKm = (lat1, lng1, lat2, lng2) => {
    if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return 9999;
    const R = 6371;
    const dLat = _toRad(lat2 - lat1);
    const dLng = _toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(_toRad(lat1)) * Math.cos(_toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};

// ── Load & parse CSV (cached in memory after first load) ─────────────────────
let _csvCache = null;
const _loadCSV = () => {
    if (_csvCache) return _csvCache;
    if (!fs.existsSync(CSV_PATH)) {
        console.warn('[Match] CSV dataset not found at:', CSV_PATH);
        return [];
    }
    console.log('[Match] Loading CSV dataset...');
    const raw = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(raw, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
    });
    _csvCache = records;
    console.log(`[Match] CSV loaded: ${records.length} records`);
    return records;
};

// ── Skill keyword map → category matching ─────────────────────────────────────
const SKILL_ALIASES = {
    plumbing: ['plumbing', 'plumber', 'pipe', 'water', 'tap', 'drain', 'leak', 'sanitary'],
    electrical: ['electrical', 'electrician', 'wiring', 'wire', 'mcb', 'circuit', 'power', 'electric'],
    'ac repair': ['ac', 'air conditioning', 'hvac', 'cooling', 'refrigeration', 'inverter ac', 'split ac'],
    cleaning: ['cleaning', 'cleaner', 'housekeeping', 'sweep', 'mop', 'pest', 'sanitiz', 'deep clean'],
    painting: ['painting', 'painter', 'paint', 'wall', 'waterproof', 'texture'],
    carpentry: ['carpentry', 'carpenter', 'wood', 'furniture', 'cabinet', 'door', 'wardrobe'],
};

const _skillMatches = (workerSkill, query) => {
    const qLower = (query || '').toLowerCase();
    const wLower = (workerSkill || '').toLowerCase();

    // Direct substring match
    if (qLower.includes(wLower) || wLower.includes(qLower.split(' ')[0])) return true;

    // Alias matching
    for (const [cat, aliases] of Object.entries(SKILL_ALIASES)) {
        const queryHitsCategory = aliases.some(a => qLower.includes(a));
        const workerHitsCategory = aliases.some(a => wLower.includes(a));
        if (queryHitsCategory && workerHitsCategory) return true;
    }
    return false;
};

// ── Demo CSV Matchmaking ──────────────────────────────────────────────────────
const _csvMatch = ({ query, location, radius, urgency, top_n }) => {
    const records = _loadCSV();
    if (!records.length) return [];

    // De-duplicate by worker_id (CSV has one row per booking)
    const seen = new Set();
    const uniqueWorkers = [];
    for (const row of records) {
        const wid = row.worker_id?.trim();
        if (!wid || seen.has(wid)) continue;
        seen.add(wid);
        uniqueWorkers.push(row);
    }

    const urgencyWeight = { critical: 1.0, high: 0.85, medium: 0.65, low: 0.4 };
    const urgencyFactor = urgencyWeight[urgency] || 0.65;

    const results = [];
    for (const row of uniqueWorkers) {
        const wLat = parseFloat(row.worker_latitude);
        const wLng = parseFloat(row.worker_longitude);
        if (isNaN(wLat) || isNaN(wLng)) continue;

        const distKm = _haversineKm(location.lat, location.lng, wLat, wLng);
        const effRadius = Math.max(radius, 50); // always use at least 50km for demo
        if (distKm > effRadius) continue;

        const primarySkill = (row.primary_skill || row.service_category || '').trim();
        const skillMatch = _skillMatches(primarySkill, query);
        if (!skillMatch) continue;

        // Compute scores
        const proximityScore = Math.max(0, 1 - distKm / effRadius);
        const trustScore = Math.min(parseFloat(row.trust_score || 0) / 100, 1);
        const ratingRaw = parseFloat(row.working_rating_given_to_customer_avg || row.ai_recommendation_score || 3.5);
        const rating = isNaN(ratingRaw) ? 3.5 : Math.min(ratingRaw, 5);
        const ratingScore = rating / 5;
        const jobsCompleted = parseInt(row.total_jobs_completed || 0, 10);
        const experienceScore = Math.min(jobsCompleted / 200, 1);
        const yearsExp = parseInt(row.years_of_experience || 0, 10);
        const expYrScore = Math.min(yearsExp / 10, 1);

        const finalScore =
            proximityScore * 0.25 +
            ratingScore * 0.30 +
            trustScore * 0.20 +
            experienceScore * 0.15 +
            expYrScore * 0.10;

        results.push({
            provider_id: row.worker_id,      // CSV id (not a Mongo ObjectId)
            name: row.full_name || `Worker ${row.worker_id}`,
            phone: row.phone_number,
            skills: [primarySkill, row.secondary_skills].filter(Boolean),
            primary_skill: primarySkill,
            service_city: row.service_city || '',
            service_area: row.service_area || '',
            rating: parseFloat(rating.toFixed(1)),
            years_experience: yearsExp,
            jobs_completed: jobsCompleted,
            base_price: row.base_service_price ? `Rs ${parseFloat(row.base_service_price).toFixed(0)}` : null,
            price_negotiable: row.price_negotiable === 'Yes' || row.price_negotiable === '1',
            availability: true,
            distance_km: parseFloat(distKm.toFixed(1)),
            final_score: parseFloat(finalScore.toFixed(4)),
            ai_scored: true,
            source: 'demo_csv',
            _isDemo: true,   // flag: no real DB record, just show in UI
            // ── AI Explainability Breakdown ──────────────────────────────────
            breakdown: {
                proximity:   parseFloat(proximityScore.toFixed(4)),
                rating:      parseFloat(ratingScore.toFixed(4)),
                trust:       parseFloat(trustScore.toFixed(4)),
                experience:  parseFloat(experienceScore.toFixed(4)),
                exp_years:   parseFloat(expYrScore.toFixed(4)),
                weights:     { proximity: 0.25, rating: 0.30, trust: 0.20, experience: 0.15, exp_years: 0.10 },
                source:      'rule_csv',
            },
        });
    }

    return results
        .sort((a, b) => b.final_score - a.final_score)
        .slice(0, top_n || 10);
};

// ── Rule-based fallback (real DB workers) ─────────────────────────────────────
const _computeProximityScore = (wLoc, cLoc, radius) => {
    if (!wLoc) return 0;
    const dist = _haversineKm(wLoc.lat, wLoc.lng, cLoc.lat, cLoc.lng);
    return dist > radius ? 0 : parseFloat((1 - dist / radius).toFixed(4));
};

const _ruleBased = async ({ query, location, radius, urgency }) => {
    const workers = await User.find({ role: 'worker', availability: true });
    if (!workers.length) return [];

    const urgencyWeight = { critical: 1.0, high: 0.8, medium: 0.6, low: 0.4 };
    const urgencyFactor = urgencyWeight[urgency] || 0.6;

    return workers
        .map((worker) => {
            const distKm = _haversineKm(
                worker.location?.lat, worker.location?.lng,
                location.lat, location.lng
            );
            if (distKm > radius) return null;

            const proximity = _computeProximityScore(worker.location, location, radius);
            const qWords = (query || '').toLowerCase().split(/\s+/);
            const wSkills = (worker.skills || []).map(s => s.toLowerCase());
            const skillMatch = qWords.filter(w => wSkills.some(s => s.includes(w))).length;
            const skillScore = wSkills.length > 0 ? skillMatch / Math.max(qWords.length, 1) : 0.3;
            const ratingScore = (worker.rating || 0) / 5;
            const finalScore = parseFloat(
                (proximity * 0.4 + skillScore * 0.35 + urgencyFactor * 0.1 + ratingScore * 0.15).toFixed(4)
            );

            return {
                provider_id: worker._id,
                name: worker.name,
                skills: worker.skills,
                primary_skill: (worker.skills || [])[0],
                rating: worker.rating,
                availability: worker.availability,
                location: worker.location,
                distance_km: parseFloat(distKm.toFixed(1)),
                final_score: finalScore,
                ai_scored: false,
                source: 'db',
                // ── AI Explainability Breakdown ──────────────────────────────────
                breakdown: {
                    proximity:  parseFloat(proximity.toFixed(4)),
                    skill:      parseFloat(skillScore.toFixed(4)),
                    urgency:    parseFloat(urgencyFactor.toFixed(4)),
                    rating:     parseFloat(ratingScore.toFixed(4)),
                    weights:    { proximity: 0.40, skill: 0.35, urgency: 0.10, rating: 0.15 },
                    source:     'rule_db',
                },
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.final_score - a.final_score);
};

// ── AI Microservice path ──────────────────────────────────────────────────────
const _aiMatch = async ({ query, location, radius, urgency, top_n }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(`${AI_SERVICE_URL}/match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, lat: location.lat, lng: location.lng, radius: radius || 50, top_n: top_n || 10 }),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`AI service ${response.status}`);
        const data = await response.json();
        const aiResults = data.data || [];

        const dbWorkers = await User.find({ role: 'worker', availability: true }).lean();
        return aiResults.map(aiW => {
            // Build the explainability breakdown from Python engine sub-scores
            const breakdown = {
                semantic:     aiW.semantic_score     ?? null,
                bm25:         aiW.bm25_score         ?? null,
                hybrid:       aiW.hybrid_score       ?? null,
                proximity:    aiW.distance_score     ?? null,
                rating:       aiW.rating_score       ?? null,
                availability: aiW.availability_score ?? null,
                weights:      { hybrid: 0.50, rating: 0.20, proximity: 0.20, availability: 0.10 },
                source:       'ai_python',
            };

            const match = dbWorkers.find(w =>
                (w.skills || []).some(s => s.toLowerCase().includes((aiW.primary_skill || '').toLowerCase().split(' ')[0]))
            );
            if (match) {
                return {
                    provider_id: match._id,
                    name: match.name,
                    skills: match.skills,
                    rating: aiW.rating ?? match.rating,
                    distance_km: aiW.distance_km,
                    primary_skill: aiW.primary_skill,
                    final_score: aiW.final_score,
                    ai_scored: true,
                    source: 'ai_service',
                    breakdown,
                };
            }
            return {
                provider_id: aiW.worker_id,
                name: `Worker #${aiW.worker_id}`,
                skills: [aiW.primary_skill],
                rating: aiW.rating,
                distance_km: aiW.distance_km,
                primary_skill: aiW.primary_skill,
                final_score: aiW.final_score,
                ai_scored: true,
                source: 'ai_service',
                _isDemo: true,
                breakdown,
            };
        });
    } finally {
        clearTimeout(timeout);
    }
};

// ── Public API ────────────────────────────────────────────────────────────────
const findMatches = async ({ query, location, radius = 10, urgency = 'medium', top_n = 10 }) => {
    // 1. Try the Python AI microservice
    try {
        console.log(`[Match] Calling AI microservice: "${query}"`);
        const results = await _aiMatch({ query, location, radius, urgency, top_n });
        if (results.length > 0) {
            console.log(`[Match] AI service: ${results.length} results`);
            return results;
        }
    } catch (err) {
        console.warn(`[Match] AI service unavailable (${err.message})`);
    }

    // 2. Try real DB workers
    try {
        const dbResults = await _ruleBased({ query, location, radius: Math.max(radius, 50), urgency });
        if (dbResults.length > 0) {
            console.log(`[Match] DB fallback: ${dbResults.length} results`);
            return dbResults.slice(0, top_n);
        }
    } catch (err) {
        console.warn(`[Match] DB fallback error (${err.message})`);
    }

    // 3. Demo CSV dataset — always works
    console.log(`[Match] Using CSV demo dataset for query: "${query}", radius: ${radius}km`);
    const csvResults = _csvMatch({ query, location, radius, urgency, top_n });
    console.log(`[Match] CSV demo: ${csvResults.length} results`);
    return csvResults;
};

module.exports = { findMatches };
