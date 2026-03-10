'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import styles from './page.module.css';
import {
    FaMapMarkerAlt, FaStar, FaBolt, FaSpinner, FaRobot,
    FaExclamationTriangle, FaSliders, FaSearch, FaDatabase,
    FaBriefcase, FaPhoneAlt, FaClock,
} from 'react-icons/fa';

const getCurrentLocation = () =>
    new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ lat: 33.6844, lng: 73.0479 });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({ lat: 33.6844, lng: 73.0479 })
        );
    });

function BookingContent() {
    const { user, loading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialService = searchParams.get('service') || 'Plumbing';

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        service: initialService,
        description: '',
        urgency: 'medium',
    });
    const [radius, setRadius] = useState(25);

    const [aiWorkers, setAiWorkers] = useState([]);
    const [taskId, setTaskId] = useState(null);
    const [matchLoading, setMatchLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(null);
    const [matchError, setMatchError] = useState('');
    const [aiPowered, setAiPowered] = useState(false);
    const [resultSource, setResultSource] = useState('');

    if (loading || !user) return <div className="section text-center">Loading...</div>;

    // ── Step 1 → Step 2 ────────────────────────────────────────────────────────
    const handleFindMatches = async (e, customRadius) => {
        e?.preventDefault();
        setMatchLoading(true);
        setMatchError('');
        const searchRadius = customRadius ?? radius;

        try {
            const location = await getCurrentLocation();

            // Create task in DB
            const taskRes = await apiFetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    title: `${formData.service} Service`,
                    description: formData.description,
                    category: formData.service,
                    urgency: formData.urgency,
                    location,
                    radius: searchRadius,
                }),
            });
            setTaskId(taskRes.data._id);

            // Get AI-ranked workers
            const matchRes = await apiFetch('/api/match', {
                method: 'POST',
                body: JSON.stringify({
                    query: `${formData.service} ${formData.description}`,
                    location,
                    radius: searchRadius,
                    urgency: formData.urgency,
                    top_n: 5,
                }),
            });

            const workers = matchRes.data || [];
            setAiWorkers(workers);
            setAiPowered(matchRes.ai_powered || workers.some(w => w.ai_scored));
            setResultSource(workers[0]?.source || '');
            setStep(2);
        } catch (err) {
            setMatchError(err.message || 'Could not find matches. Please try again.');
        } finally {
            setMatchLoading(false);
        }
    };

    // ── Widen radius & retry ───────────────────────────────────────────────────
    const handleWidenRadius = async () => {
        const newRadius = Math.min(radius + 25, 200);
        setRadius(newRadius);
        await handleFindMatches(null, newRadius);
    };

    // ── Select a worker ────────────────────────────────────────────────────────
    const handleSelectWorker = async (worker) => {
        if (!taskId) {
            setMatchError('Task was not created. Please go back and try again.');
            return;
        }

        // Demo CSV workers have non-Mongo IDs — assign to task but treat differently
        const isDemo = worker._isDemo || String(worker.provider_id).length !== 24;
        setAssignLoading(worker.provider_id);

        try {
            if (isDemo) {
                // For demo CSV workers: just update task status, don't need real assignment
                await apiFetch(`/api/tasks/${taskId}/assign-demo`, {
                    method: 'POST',
                    body: JSON.stringify({
                        worker_name: worker.name,
                        worker_skill: worker.primary_skill,
                        worker_id: String(worker.provider_id),
                    }),
                }).catch(() => { }); // Non-fatal — navigate regardless
                router.push(`/client/job/${taskId}`);
            } else {
                await apiFetch(`/api/tasks/${taskId}/assign`, {
                    method: 'POST',
                    body: JSON.stringify({ worker_id: worker.provider_id }),
                });
                router.push(`/client/job/${taskId}`);
            }
        } catch (err) {
            setMatchError(err.message || 'Could not assign worker. Please try again.');
            setAssignLoading(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Book a Service</h1>
                <p>Tell us what you need and let our AI find the best professionals.</p>
                <div className={styles.progress}>
                    <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>1. Details</div>
                    <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>2. Match</div>
                    <div className={styles.step}>3. Track</div>
                </div>
            </div>

            <div className={styles.content}>

                {/* ── Step 1: Job Details ──────────────────────────────────────── */}
                {step === 1 && (
                    <Card className={styles.formCard}>
                        <form onSubmit={handleFindMatches} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Service Type</label>
                                <input type="text" value={formData.service} readOnly className={styles.readOnly} />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Task Description *</label>
                                <textarea
                                    rows="4"
                                    placeholder={`e.g. The ${formData.service.toLowerCase()} in my kitchen needs urgent repair...`}
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Urgency</label>
                                <select
                                    value={formData.urgency}
                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                >
                                    <option value="low">Low — Flexible timing</option>
                                    <option value="medium">Medium — Within 24 hours</option>
                                    <option value="high">High — Within a few hours</option>
                                    <option value="critical">Critical — ASAP</option>
                                </select>
                            </div>

                            {/* ── Radius Slider ─────────────────────────────────── */}
                            <div className={styles.inputGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FaMapMarkerAlt style={{ color: '#6366f1' }} />
                                    Search Radius: <strong style={{ color: '#6366f1' }}>&nbsp;{radius} km</strong>
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="200"
                                    step="5"
                                    value={radius}
                                    onChange={(e) => setRadius(Number(e.target.value))}
                                    className={styles.radiusSlider}
                                />
                                <div className={styles.radiusHints}>
                                    <span>5 km (local)</span>
                                    <span>200 km (country-wide)</span>
                                </div>
                                <p className={styles.locationNote}>
                                    <FaMapMarkerAlt style={{ marginRight: 4 }} />
                                    Your device location is used as the search center. Demo mode searches nationally if no local workers are found.
                                </p>
                            </div>

                            {matchError && (
                                <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>
                                    <FaExclamationTriangle style={{ marginRight: 4 }} /> {matchError}
                                </div>
                            )}

                            <Button type="submit" size="large" disabled={matchLoading}>
                                {matchLoading ? (
                                    <><FaSpinner style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />Finding AI Matches...</>
                                ) : (
                                    <><FaBolt style={{ marginRight: 8 }} />Find AI Matches</>
                                )}
                            </Button>
                        </form>
                    </Card>
                )}

                {/* ── Step 2: Match Results ────────────────────────────────────── */}
                {step === 2 && (
                    <div className={styles.matchSection}>
                        <div className={styles.matchHeader}>
                            <h2>
                                <FaRobot style={{ color: '#6366f1', marginRight: '8px' }} />
                                {aiPowered ? 'AI Recommended Workers' : 'Matched Workers'}
                            </h2>
                            <p>
                                {aiPowered ? 'Ranked by our semantic AI engine.' : 'Ranked by proximity and skill match.'}
                                {' '}Showing workers within <strong>{radius} km</strong>.
                            </p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                                {aiPowered && (
                                    <span style={{
                                        fontSize: 12, fontWeight: 600, background: '#ede9fe',
                                        color: '#7c3aed', borderRadius: 20, padding: '3px 10px',
                                    }}>✨ AI Powered</span>
                                )}
                                {resultSource === 'demo_csv' && (
                                    <span style={{
                                        fontSize: 12, fontWeight: 600, background: '#dbeafe',
                                        color: '#1d4ed8', borderRadius: 20, padding: '3px 10px',
                                        display: 'flex', alignItems: 'center', gap: 4,
                                    }}>
                                        <FaDatabase size={10} /> Demo Dataset
                                    </span>
                                )}
                            </div>
                        </div>

                        {matchError && (
                            <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>
                                <FaExclamationTriangle style={{ marginRight: 4 }} /> {matchError}
                            </div>
                        )}

                        {/* ── No results state ──────────────────────────────────── */}
                        {aiWorkers.length === 0 ? (
                            <Card style={{ padding: 32 }}>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <FaSearch size={32} style={{ color: '#94a3b8', marginBottom: 12 }} />
                                    <h3 style={{ color: '#1e293b', marginBottom: 8 }}>No workers found in {radius} km</h3>
                                    <p style={{ color: '#64748b', fontSize: 14 }}>
                                        No available workers matched your request within the current radius.
                                        Try widening the search or changing the service type.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Button onClick={handleWidenRadius} disabled={matchLoading}>
                                        {matchLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : (
                                            <><FaMapMarkerAlt style={{ marginRight: 6 }} />Widen to {Math.min(radius + 25, 200)} km & Retry</>
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={() => setStep(1)}>
                                        ← Change Details
                                    </Button>
                                </div>
                                {radius >= 150 && (
                                    <p style={{ textAlign: 'center', marginTop: 16, color: '#64748b', fontSize: 13 }}>
                                        Still no results? Make sure the backend server is running and the CSV dataset is loaded.
                                    </p>
                                )}
                            </Card>
                        ) : (
                            <div className={styles.workerList}>
                                {aiWorkers.map((w) => (
                                    <Card key={String(w.provider_id)} className={styles.workerCard}>
                                        <div className={styles.workerInfo}>
                                            <div className={styles.avatar}>
                                                {w.name ? w.name.charAt(0).toUpperCase() : 'W'}
                                            </div>
                                            <div className={styles.details}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <h3>{w.name || 'Service Professional'}</h3>
                                                    {w._isDemo && (
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 700, background: '#eff6ff',
                                                            color: '#3b82f6', borderRadius: 20, padding: '2px 7px',
                                                        }}>DEMO</span>
                                                    )}
                                                </div>
                                                <div className={styles.stats}>
                                                    <span className={styles.rating}>
                                                        <FaStar style={{ color: '#f59e0b' }} /> {(w.rating || 0).toFixed(1)}
                                                    </span>
                                                    <span>• {(w.skills || [w.primary_skill]).filter(Boolean).join(', ') || 'General Services'}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                                                    {w.distance_km != null && (
                                                        <span className={styles.distance}>
                                                            <FaMapMarkerAlt style={{ marginRight: 3 }} />{w.distance_km.toFixed(1)} km away
                                                        </span>
                                                    )}
                                                    {w.jobs_completed != null && (
                                                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <FaBriefcase /> {w.jobs_completed} jobs done
                                                        </span>
                                                    )}
                                                    {w.years_experience != null && w.years_experience > 0 && (
                                                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <FaClock /> {w.years_experience} yrs exp
                                                        </span>
                                                    )}
                                                    {w.service_city && (
                                                        <span style={{ fontSize: 12, color: '#64748b' }}>
                                                            📍 {w.service_city}
                                                        </span>
                                                    )}
                                                </div>
                                                {w.base_price && (
                                                    <div style={{ marginTop: 4, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                                                        {w.base_price} base rate
                                                        {w.price_negotiable && <span style={{ color: '#64748b', fontWeight: 400 }}> · negotiable</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.pricing}>
                                            <span className={styles.score}>
                                                Match: {(w.final_score * 100).toFixed(0)}%
                                            </span>
                                            <Button
                                                onClick={() => handleSelectWorker(w)}
                                                disabled={assignLoading === w.provider_id}
                                            >
                                                {assignLoading === w.provider_id ? (
                                                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                                ) : 'Select & Continue'}
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {aiWorkers.length > 0 && (
                            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    ← Back to Details
                                </Button>
                                <Button variant="outline" onClick={handleWidenRadius} disabled={matchLoading || radius >= 200}>
                                    {matchLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : (
                                        <><FaSearch style={{ marginRight: 6 }} />Widen radius ({Math.min(radius + 25, 200)} km)</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookPage() {
    return (
        <Suspense fallback={<div className="section text-center">Loading booking flow...</div>}>
            <BookingContent />
        </Suspense>
    );
}
