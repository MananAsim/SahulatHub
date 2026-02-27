const User = require('../models/User');

/**
 * Placeholder Hybrid Matchmaking Service
 * ─────────────────────────────────────────────────────────────────────────────
 * This module is intentionally designed to be modular and extensible.
 * AI/ML logic can be swapped into computeHybridScore() and computeContextScore()
 * in a future iteration without changing the API contract.
 *
 * Scoring breakdown:
 *   - contextScore  → context-aware factors (urgency, location proximity, skills)
 *   - hybridScore   → collaborative/content-based factors (rating, availability)
 *   - finalScore    → weighted combination of both scores
 */

/**
 * Calculate a simple distance-based score (placeholder for geo-relevance)
 * @param {Object} workerLocation - { lat, lng }
 * @param {Object} queryLocation  - { lat, lng }
 * @param {number} radius - max radius in km
 * @returns {number} score 0-1
 */
const computeProximityScore = (workerLocation, queryLocation, radius) => {
    if (!workerLocation || !queryLocation) return 0.5;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(queryLocation.lat - workerLocation.lat);
    const dLng = toRad(queryLocation.lng - workerLocation.lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(workerLocation.lat)) *
        Math.cos(toRad(queryLocation.lat)) *
        Math.sin(dLng / 2) ** 2;

    const distance = 2 * R * Math.asin(Math.sqrt(a));
    if (distance > radius) return 0;
    return parseFloat((1 - distance / radius).toFixed(4));
};

/**
 * Placeholder context score
 * Factors: proximity, urgency weighting, skill match
 */
const computeContextScore = (worker, { location, radius, urgency, query }) => {
    const proximityScore = computeProximityScore(worker.location, location, radius);

    // Skill match: simple keyword overlap with query
    const queryWords = (query || '').toLowerCase().split(/\s+/);
    const workerSkills = (worker.skills || []).map((s) => s.toLowerCase());
    const matchedSkills = queryWords.filter((w) => workerSkills.some((s) => s.includes(w)));
    const skillScore = workerSkills.length > 0 ? matchedSkills.length / Math.max(queryWords.length, 1) : 0.3;

    // Urgency multiplier (higher urgency → availability matters more)
    const urgencyWeight = { critical: 1.0, high: 0.8, medium: 0.6, low: 0.4 };
    const urgencyFactor = urgencyWeight[urgency] || 0.6;

    const availabilityBonus = worker.availability ? 0.2 : 0;

    const contextScore = proximityScore * 0.4 + skillScore * 0.35 + urgencyFactor * 0.15 + availabilityBonus;
    return parseFloat(Math.min(contextScore, 1).toFixed(4));
};

/**
 * Placeholder hybrid score
 * Factors: rating-based collaborative filtering (stub)
 */
const computeHybridScore = (worker) => {
    // Normalize rating from 0-5 to 0-1 and add a random collaborative component
    const ratingScore = (worker.rating || 0) / 5;
    // TODO: Replace with actual collaborative filtering model output
    const collaborativeStub = Math.random() * 0.2; // placeholder
    return parseFloat(Math.min(ratingScore * 0.7 + collaborativeStub, 1).toFixed(4));
};

/**
 * Main matchmaking function
 * @param {Object} params - { query, location, radius, urgency }
 * @returns {Array} ranked list of providers with scores
 */
const findMatches = async ({ query, location, radius = 10, urgency = 'medium' }) => {
    // Fetch all available workers
    const workers = await User.find({ role: 'worker', availability: true });

    if (!workers.length) {
        return [];
    }

    const scoredProviders = workers.map((worker) => {
        const contextScore = computeContextScore(worker, { location, radius, urgency, query });
        const hybridScore = computeHybridScore(worker);
        const finalScore = parseFloat((contextScore * 0.6 + hybridScore * 0.4).toFixed(4));

        return {
            provider_id: worker._id,
            name: worker.name,
            skills: worker.skills,
            rating: worker.rating,
            availability: worker.availability,
            location: worker.location,
            context_score: contextScore,
            hybrid_score: hybridScore,
            final_score: finalScore,
        };
    });

    // Sort by final_score descending
    return scoredProviders.sort((a, b) => b.final_score - a.final_score);
};

module.exports = { findMatches };
