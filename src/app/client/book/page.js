'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import styles from './page.module.css';
import { FaMapMarkerAlt, FaUpload, FaStar, FaBolt } from 'react-icons/fa';

function BookingContent() {
    const { user, role, loading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialService = searchParams.get('service') || 'Plumbing';

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        service: initialService,
        description: '',
        urgency: 'normal',
        location: '',
    });

    const [aiWorkers, setAiWorkers] = useState([]);

    if (loading || !user) return <div className="section text-center">Loading...</div>;

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1) {
            // Simulate AI Matching
            setAiWorkers([
                { id: 'w1', name: 'Ali Hassan', rating: 4.8, jobs: 142, price: 'Rs 1500', est: '30 mins away' },
                { id: 'w2', name: 'Usman Khan', rating: 4.9, jobs: 89, price: 'Rs 1200', est: '45 mins away' },
                { id: 'w3', name: 'Faizan Ahmed', rating: 4.6, jobs: 54, price: 'Rs 1000', est: '1 hr away' },
            ]);
            setStep(2);
        }
    };

    const handeSelectWorker = (workerId) => {
        // In a real app, create job in DB and return job ID.
        router.push(`/client/job/j123?worker=${workerId}`);
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
                {step === 1 && (
                    <Card className={styles.formCard}>
                        <form onSubmit={handleNext} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Service Type</label>
                                <input type="text" value={formData.service} readOnly className={styles.readOnly} />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Task Description</label>
                                <textarea
                                    rows="4"
                                    placeholder="e.g. The kitchen sink pipe is leaking..."
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Add Photos/Video (Optional)</label>
                                <div className={styles.uploadArea}>
                                    <FaUpload className={styles.uploadIcon} />
                                    <span>Click to attach files</span>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup} style={{ flex: 1 }}>
                                    <label>Location</label>
                                    <div className={styles.locationInput}>
                                        <FaMapMarkerAlt className={styles.icon} />
                                        <input
                                            type="text"
                                            placeholder="Your address..."
                                            required
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup} style={{ width: '200px' }}>
                                    <label>Urgency</label>
                                    <select
                                        value={formData.urgency}
                                        onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <Button type="submit" size="large" className="mt-4">Find AI Matches</Button>
                        </form>
                    </Card>
                )}

                {step === 2 && (
                    <div className={styles.matchSection}>
                        <div className={styles.matchHeader}>
                            <h2><FaBolt style={{ color: 'var(--warning)', marginRight: '8px' }} /> AI Recommended Workers</h2>
                            <p>Based on your location ({formData.location}) and task description.</p>
                        </div>

                        <div className={styles.workerList}>
                            {aiWorkers.map(w => (
                                <Card key={w.id} className={styles.workerCard}>
                                    <div className={styles.workerInfo}>
                                        <div className={styles.avatar}>{w.name.charAt(0)}</div>
                                        <div className={styles.details}>
                                            <h3>{w.name}</h3>
                                            <div className={styles.stats}>
                                                <span className={styles.rating}><FaStar /> {w.rating}</span>
                                                <span>• {w.jobs} jobs completed</span>
                                            </div>
                                            <span className={styles.distance}>{w.est}</span>
                                        </div>
                                    </div>
                                    <div className={styles.pricing}>
                                        <span className={styles.price}>{w.price}</span>
                                        <span className={styles.estimate}>Estimate</span>
                                        <Button onClick={() => handeSelectWorker(w.id)}>Select & Continue</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <Button variant="outline" onClick={() => setStep(1)} className="mt-4">Back to Details</Button>
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
