'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ReviewModal from '@/components/ReviewModal';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import {
    FaPhoneAlt, FaVideo, FaCommentDots, FaMapMarkerAlt,
    FaCheckCircle, FaSpinner, FaStar,
} from 'react-icons/fa';

// Leaflet uses window, so it must be dynamically imported with SSR disabled
const LiveTrackingMap = dynamic(() => import('@/components/LiveTrackingMap'), { ssr: false });

const STATUS_STEPS = ['open', 'assigned', 'in_progress', 'pending_client_confirmation', 'completed'];
const STATUS_LABELS = ['Confirmed', 'Pending Worker', 'Worker Accepted', 'Job Done', 'Completed'];

export default function JobDetailsPage({ params }) {
    const { id } = use(params);
    const { user, loading } = useAuth();
    const router = useRouter();

    const [task, setTask] = useState(null);
    const [taskLoading, setTaskLoading] = useState(true);
    const [taskError, setTaskError] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isWorkerArrived, setIsWorkerArrived] = useState(false);

    // Load the task from DB periodically (polling)
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await apiFetch(`/api/tasks/${id}`);
                setTask(res.data);
                setTaskError('');
            } catch (err) {
                setTaskError(err.message || 'Failed to load task details.');
            } finally {
                setTaskLoading(false);
            }
        };

        if (!id) return;
        fetchTask(); // initial fetch
        const intervalId = setInterval(fetchTask, 5000); // Poll every 5s

        return () => clearInterval(intervalId);
    }, [id]);

    if (loading || !user) return <div className="section text-center">Loading...</div>;
    if (taskLoading) return <div className="section text-center"><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading job...</div>;
    if (taskError && !task) return (
        <div className="section text-center" style={{ color: '#dc2626' }}>
            ⚠️ Could not load job: {taskError}
        </div>
    );

    const currentStep = STATUS_STEPS.indexOf(task?.status ?? 'open');
    const worker = task?.assigned_worker_id;
    const isCompleted = task?.status === 'completed';
    const hasWorkerAccepted = currentStep >= 2; // 'in_progress' or later
    
    const handleWorkerArrived = async () => {
        setIsWorkerArrived(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.mainCol}>
                    <div className={styles.header}>
                        <h1>Job #{id?.slice(-6).toUpperCase()}</h1>
                        <span className={styles.statusBadge} style={{
                            background: isCompleted ? '#dcfce7' : '#eff6ff',
                            color: isCompleted ? '#16a34a' : '#1d4ed8',
                        }}>
                            {task?.status?.replace('_', ' ') ?? 'Unknown'}
                        </span>
                    </div>

                    {/* Progress tracker */}
                    <Card className={styles.trackerCard}>
                        <div className={styles.progressTracker}>
                            {STATUS_LABELS.map((label, index) => (
                                <div
                                    key={index}
                                    className={`${styles.step} ${index <= currentStep ? styles.activeStep : ''}`}
                                >
                                    <div className={styles.stepCircle}>
                                        {index < currentStep ? <FaCheckCircle /> : index + 1}
                                    </div>
                                    <span>{label}</span>
                                    {index < STATUS_LABELS.length - 1 && <div className={styles.stepLine} />}
                                </div>
                            ))}
                        </div>

                        {hasWorkerAccepted ? (
                            <>
                                <div style={{ marginTop: '24px', marginBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                    <LiveTrackingMap
                                        clientLocation={task?.location}
                                        workerLocation={worker?.location || null}
                                        isCompleted={isCompleted}
                                        workerName={worker?.name}
                                        onArrived={handleWorkerArrived}
                                    />
                                </div>
                                <p className={styles.eta} style={{ textAlign: 'center', marginTop: '12px', fontWeight: 600, color: isCompleted || isWorkerArrived ? '#16a34a' : '#2563eb' }}>
                                    {isCompleted ? 'Job Completed ✅' : isWorkerArrived ? 'Worker Arrived. Job is in progress 🔧' : 'Worker en route...'}
                                </p>
                            </>
                        ) : currentStep === 1 ? (
                            <div style={{ marginTop: '24px', padding: '24px', background: '#fef3c7', borderRadius: '12px', textAlign: 'center', color: '#b45309' }}>
                                <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: 24, marginBottom: 12 }} />
                                <h3 style={{ marginBottom: 8 }}>Waiting for Worker Confirmation</h3>
                                <p style={{ fontSize: 14 }}>{worker?.name || 'Your worker'} has been booked and is reviewing the details. Live tracking and chat will unlock once they accept the job.</p>
                            </div>
                        ) : null}
                    </Card>

                    {/* Real Job Details */}
                    <Card className="mt-4">
                        <h2>Job Details</h2>
                        <div className={styles.jobInfo}>
                            <p><strong>Title:</strong> {task?.title}</p>
                            <p><strong>Category:</strong> {task?.category}</p>
                            <p><strong>Urgency:</strong> {task?.urgency}</p>
                            <p><strong>Description:</strong> {task?.description}</p>
                            {task?.location && (
                                <p><strong>Location:</strong> {task.location.lat?.toFixed(4)}°N, {task.location.lng?.toFixed(4)}°E</p>
                            )}
                        </div>

                        {isCompleted && (
                            <div style={{ marginTop: 16 }}>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowReviewModal(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                >
                                    <FaStar style={{ color: '#f59e0b' }} />
                                    Leave a Review
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Side column — Worker info */}
                <div className={styles.sideCol}>
                    <Card className={styles.workerProfile}>
                        <div className={styles.avatar} style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: '#6366f1', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 700,
                            margin: '0 auto 12px',
                        }}>
                            {worker?.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                        </div>
                        <h3>{worker?.name || 'Worker'}</h3>
                        <p className={styles.workerRole}>
                            {(worker?.skills || []).slice(0, 2).join(', ') || 'Service Professional'}
                        </p>
                        {worker?.rating != null && (
                            <p style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                                <FaStar style={{ marginRight: 3 }} /> {Number(worker.rating).toFixed(1)} rating
                            </p>
                        )}

                        {hasWorkerAccepted ? (
                            <div className={styles.communication}>
                                <button
                                    className={styles.commBtn}
                                    onClick={() => router.push(`/client/job/${id}/chat`)}
                                    title="Chat"
                                >
                                    <FaCommentDots />
                                </button>
                                <button className={styles.commBtn} title="Call"><FaPhoneAlt /></button>
                                <button className={styles.commBtn} title="Video"><FaVideo /></button>
                            </div>
                        ) : currentStep === 1 ? (
                            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
                                Communication unlocks when the worker accepts the job.
                            </p>
                        ) : null}
                    </Card>

                    <Card className="mt-4">
                        <h3>Payment Summary</h3>
                        <div className={styles.receiptLine}>
                            <span>Budget / Estimate</span>
                            <span>Rs {task?.budget || '—'}</span>
                        </div>
                        <p className={styles.paymentNote}>Final price agreed with the worker on site.</p>

                        {task?.payment_status === 'paid' ? (
                            <div style={{ marginTop: '16px', padding: '12px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                                ✅ Payment Completed
                            </div>
                        ) : task?.status === 'pending_client_confirmation' ? (
                            <Button
                                style={{ width: '100%', marginTop: '16px', background: '#10b981', color: 'white', borderColor: '#10b981' }}
                                onClick={() => router.push(`/client/payment/${id}`)}
                            >
                                Confirm Job Done & Pay
                            </Button>
                        ) : (
                            <div style={{ marginTop: '16px', padding: '12px', background: '#f1f5f9', color: '#64748b', borderRadius: '8px', textAlign: 'center', fontSize: 14 }}>
                                Payment will unlock once the worker marks the job as done.
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Review modal — shown after task is marked complete */}
            {showReviewModal && (
                <ReviewModal
                    taskId={id}
                    workerName={worker?.name || 'the worker'}
                    onClose={() => setShowReviewModal(false)}
                />
            )}
        </div>
    );
}
