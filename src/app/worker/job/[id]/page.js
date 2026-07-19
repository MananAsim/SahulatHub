'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaComments, FaArrowLeft, FaCheck } from 'react-icons/fa';

export default function WorkerJobDetails({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await apiFetch(`/api/tasks/${id}`);
                setTask(res.data);
            } catch (err) {
                console.error('Failed to load task', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
        const intervalId = setInterval(fetchTask, 5000);

        return () => clearInterval(intervalId);
    }, [id]);

    const statuses = [
        { key: 'open', label: 'Open' },
        { key: 'assigned', label: 'Pending Acceptance' },
        { key: 'in_progress', label: 'Accepted & En Route' },
        { key: 'pending_client_confirmation', label: 'Done - Waiting on Client' },
        { key: 'completed', label: 'Finished & Paid' }
    ];

    const currentStepIndex = task ? statuses.findIndex(s => s.key === task.status) : 0;

    const handleNextStatus = async () => {
        if (!task || currentStepIndex >= statuses.length - 1) return;
        const nextStatus = statuses[currentStepIndex + 1].key;
        try {
            await apiFetch(`/api/tasks/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: nextStatus })
            });
            setTask({ ...task, status: nextStatus });
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    if (loading) return <div className={styles.container}>Loading task details...</div>;
    if (!task) return <div className={styles.container}>Task not found.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button className={styles.backButton} onClick={() => router.push('/worker/dashboard')}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <div className={styles.titleRow}>
                        <h1>Job #{task._id.substring(0, 6)}</h1>
                        <span className={styles.statusBadge}>{statuses[currentStepIndex]?.label || task.status}</span>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.trackerContainer}>
                    <Card className={styles.trackerCard}>
                        <h2>Job Status</h2>
                        <div className={styles.timeline}>
                            {statuses.slice(1).map((s, idx) => {
                                const actualIdx = idx + 1; // shift by 1 to ignore 'open'
                                const isActive = actualIdx === currentStepIndex;
                                const isPast = actualIdx < currentStepIndex;
                                return (
                                    <div key={s.key} className={`${styles.timelineStep} ${isActive ? styles.activeStep : ''} ${isPast ? styles.pastStep : ''}`}>
                                        <div className={styles.stepCircle}>
                                            {isPast ? <FaCheck /> : idx + 1}
                                        </div>
                                        <div className={styles.stepLabel}>{s.label}</div>
                                        {idx !== statuses.slice(1).length - 1 && <div className={styles.stepLine}></div>}
                                    </div>
                                );
                            })}
                        </div>

                        {task.status === 'assigned' && (
                            <Button size="large" className={styles.statusButton} onClick={handleNextStatus}>
                                Accept Job & Start Route
                            </Button>
                        )}
                        {task.status === 'in_progress' && (
                            <Button size="large" className={styles.statusButton} onClick={handleNextStatus}>
                                Job Done - Request Payment
                            </Button>
                        )}
                        {task.status === 'pending_client_confirmation' && (
                            <div className={styles.successMessage} style={{ background: '#fef3c7', color: '#b45309' }}>
                                <FaCheck size={32} />
                                <h3>Waiting for Client</h3>
                                <p>You have marked this job as done. Waiting for the client to confirm and complete payment.</p>
                                <Button className="mt-4" onClick={() => router.push('/worker/dashboard')} variant="outline">Back to Dashboard</Button>
                            </div>
                        )}
                        {task.status === 'completed' && (
                            <div className={styles.successMessage}>
                                <FaCheck size={32} color="var(--success)" />
                                <h3>Job Completed & Paid!</h3>
                                <p>Rs {task.budget || 'Market Rate'} has been added to your pending balance.</p>
                                <Button className="mt-4" onClick={() => router.push('/worker/dashboard')}>Return Home</Button>
                            </div>
                        )}
                    </Card>
                </div>

                <div className={styles.detailsGrid}>
                    <Card className={styles.detailCard}>
                        <h3>Task Description</h3>
                        <p className={styles.jobService}>{task.title} {task.urgency === 'urgent' && <span className={styles.urgentTag}>URGENT</span>}</p>
                        <p className={styles.jobBrief}>{task.description}</p>

                        <div className={styles.payoutBox}>
                            <span>Estimated Payout</span>
                            <strong>Rs {task.budget || 'Negotiable'}</strong>
                        </div>
                    </Card>

                    <Card className={styles.detailCard}>
                        <h3>Client & Location</h3>
                        <div className={styles.clientProfile}>
                            <div className={styles.avatar}>{task.client_id?.name?.charAt(0) || 'C'}</div>
                            <div>
                                <h4>{task.client_id?.name || 'Client'}</h4>
                                <p>Client since 2026</p>
                            </div>
                        </div>

                        <div className={styles.locationBox}>
                            <FaMapMarkerAlt className={styles.locIcon} />
                            <div>
                                <strong>Location Provided</strong>
                                <p>Lat: {task.location?.lat?.toFixed(2)}, Lng: {task.location?.lng?.toFixed(2)}</p>
                            </div>
                        </div>

                        {task.status !== 'open' && task.status !== 'assigned' ? (
                            <div className={styles.actionButtons}>
                                <Button variant="outline" className={styles.btnIcon}><FaPhoneAlt /> Call</Button>
                                <Button variant="outline" className={styles.btnIcon} onClick={() => router.push(`/worker/job/${task._id}/chat`)}><FaComments /> Chat</Button>
                                <Button className={styles.btnIcon} style={{ flex: 1 }}><FaMapMarkerAlt /> Navigate</Button>
                            </div>
                        ) : (
                            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 16 }}>
                                Communication and navigation will unlock after you accept the job.
                            </p>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
