'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaComments, FaArrowLeft, FaCheck } from 'react-icons/fa';

export default function WorkerJobDetails({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();

    const [status, setStatus] = useState('accepted'); // accepted, on_way, arrived, in_progress, completed

    // Mock data for the specific job
    const job = {
        id: unwrappedParams.id,
        service: 'Plumbing Repair',
        clientName: 'Ahmed Raza',
        address: '12-B, Model Town, Lahore',
        description: 'The sink under the kitchen is leaking heavily and needs immediate pipe replacement.',
        urgency: 'urgent',
        estimatedPayout: 'Rs 1500',
        distance: '2.5 km',
    };

    const statuses = [
        { key: 'accepted', label: 'Accepted' },
        { key: 'on_way', label: 'On the Way' },
        { key: 'arrived', label: 'Arrived' },
        { key: 'in_progress', label: 'Working' },
        { key: 'completed', label: 'Finished' }
    ];

    const currentStepIndex = statuses.findIndex(s => s.key === status);

    const handleNextStatus = () => {
        if (currentStepIndex < statuses.length - 1) {
            setStatus(statuses[currentStepIndex + 1].key);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button className={styles.backButton} onClick={() => router.push('/worker/dashboard')}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <div className={styles.titleRow}>
                        <h1>Job #{job.id}</h1>
                        <span className={styles.statusBadge}>{statuses[currentStepIndex].label}</span>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.trackerContainer}>
                    <Card className={styles.trackerCard}>
                        <h2>Job Status</h2>
                        <div className={styles.timeline}>
                            {statuses.map((s, idx) => {
                                const isActive = idx === currentStepIndex;
                                const isPast = idx < currentStepIndex;
                                return (
                                    <div key={s.key} className={`${styles.timelineStep} ${isActive ? styles.activeStep : ''} ${isPast ? styles.pastStep : ''}`}>
                                        <div className={styles.stepCircle}>
                                            {isPast ? <FaCheck /> : idx + 1}
                                        </div>
                                        <div className={styles.stepLabel}>{s.label}</div>
                                        {idx !== statuses.length - 1 && <div className={styles.stepLine}></div>}
                                    </div>
                                );
                            })}
                        </div>

                        {status !== 'completed' && (
                            <Button size="large" className={styles.statusButton} onClick={handleNextStatus}>
                                Mark as {statuses[currentStepIndex + 1]?.label}
                            </Button>
                        )}
                        {status === 'completed' && (
                            <div className={styles.successMessage}>
                                <FaCheck size={32} color="var(--success)" />
                                <h3>Job Completed Successfully!</h3>
                                <p>Rs 1500 has been added to your pending balance.</p>
                                <Button className="mt-4" onClick={() => router.push('/worker/dashboard')}>Return Home</Button>
                            </div>
                        )}
                    </Card>
                </div>

                <div className={styles.detailsGrid}>
                    <Card className={styles.detailCard}>
                        <h3>Task Description</h3>
                        <p className={styles.jobService}>{job.service} {job.urgency === 'urgent' && <span className={styles.urgentTag}>URGENT</span>}</p>
                        <p className={styles.jobBrief}>{job.description}</p>

                        <div className={styles.photoGridPlaceholder}>
                            <div className={styles.photoBox}>Client Photo 1</div>
                        </div>

                        <div className={styles.payoutBox}>
                            <span>Estimated Payout</span>
                            <strong>{job.estimatedPayout}</strong>
                        </div>
                    </Card>

                    <Card className={styles.detailCard}>
                        <h3>Client & Location</h3>
                        <div className={styles.clientProfile}>
                            <div className={styles.avatar}>{job.clientName.charAt(0)}</div>
                            <div>
                                <h4>{job.clientName}</h4>
                                <p>Client since 2026</p>
                            </div>
                        </div>

                        <div className={styles.locationBox}>
                            <FaMapMarkerAlt className={styles.locIcon} />
                            <div>
                                <strong>{job.address}</strong>
                                <p>{job.distance} away from your location</p>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <Button variant="outline" className={styles.btnIcon}><FaPhoneAlt /> Call</Button>
                            <Button variant="outline" className={styles.btnIcon}><FaComments /> Chat</Button>
                            <Button className={styles.btnIcon} style={{ flex: 1 }}><FaMapMarkerAlt /> Navigate</Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
