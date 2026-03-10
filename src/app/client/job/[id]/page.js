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

const STATUS_STEPS = ['open', 'assigned', 'in_progress', 'completed'];
const STATUS_LABELS = ['Confirmed', 'Assigned', 'In Progress', 'Completed'];

export default function JobDetailsPage({ params }) {
    const { id } = use(params);
    const { user, loading } = useAuth();
    const router = useRouter();

    const [task, setTask] = useState(null);
    const [taskLoading, setTaskLoading] = useState(true);
    const [taskError, setTaskError] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Load the task from DB
    useEffect(() => {
        if (!id) return;
        apiFetch(`/api/tasks/${id}`)
            .then((res) => setTask(res.data))
            .catch((err) => setTaskError(err.message))
            .finally(() => setTaskLoading(false));
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
    const canMarkComplete = task?.status === 'in_progress';

    const handleMarkComplete = async () => {
        setStatusUpdating(true);
        try {
            const res = await apiFetch(`/api/tasks/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            });
            setTask(res.data);
            setShowReviewModal(true);
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        } finally {
            setStatusUpdating(false);
        }
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

                        {/* Real Interactive Map for Live Tracking */}
                        <div style={{ marginTop: '24px', marginBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <LiveTrackingMap
                                clientLocation={task?.location}
                                workerLocation={task?.worker_location || null}
                                isCompleted={isCompleted}
                                workerName={worker?.name}
                            />
                        </div>
                        <p className={styles.eta} style={{ textAlign: 'center', marginTop: '12px', fontWeight: 600, color: isCompleted ? '#16a34a' : '#2563eb' }}>
                            {isCompleted ? 'Job Completed ✅' : 'Worker en route...'}
                        </p>
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

                        {canMarkComplete && (
                            <Button
                                style={{ marginTop: 16 }}
                                onClick={handleMarkComplete}
                                disabled={statusUpdating}
                            >
                                {statusUpdating
                                    ? <><FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />Updating...</>
                                    : '✅ Mark as Completed'
                                }
                            </Button>
                        )}

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
                    </Card>

                    <Card className="mt-4">
                        <h3>Payment Summary</h3>
                        <div className={styles.receiptLine}>
                            <span>Budget / Estimate</span>
                            <span>Rs {task?.budget || '—'}</span>
                        </div>
                        <p className={styles.paymentNote}>Final price agreed with the worker on site.</p>

                        <Button
                            style={{ width: '100%', marginTop: '16px' }}
                            onClick={() => router.push(`/client/payment/${id}`)}
                        >
                            Proceed to Payment
                        </Button>
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
