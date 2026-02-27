'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaMoneyBillWave, FaCheckCircle, FaStar, FaMapMarkerAlt, FaWifi, FaSpinner } from 'react-icons/fa';

export default function WorkerDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [isOnline, setIsOnline] = useState(true);
    const [greeting, setGreeting] = useState('Welcome back');

    // ── Real data state ───────────────────────────────────────────────────────
    const [stats, setStats] = useState(null);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);

    // ── Greeting ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    // ── Fetch real stats + tasks from backend ─────────────────────────────────
    const fetchDashboardData = useCallback(async () => {
        setDataLoading(true);
        setDataError(null);
        try {
            const [statsData, tasksData] = await Promise.all([
                apiFetch('/api/workers/me/stats'),
                apiFetch('/api/tasks/worker'),
            ]);

            setStats(statsData.data);
            setAssignedTasks(tasksData.data || []);
        } catch (err) {
            console.error('Dashboard fetch error:', err.message);
            setDataError(err.message);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        // Only fetch once auth has resolved and user is confirmed a worker
        if (!authLoading && user) {
            fetchDashboardData();
        }
    }, [authLoading, user, fetchDashboardData]);

    // ── Guard ─────────────────────────────────────────────────────────────────
    if (authLoading || !user) {
        return <div className="section text-center">Loading dashboard...</div>;
    }

    const handleAcceptJob = (taskId) => {
        router.push(`/worker/job/${taskId}`);
    };

    // Open tasks are ones assigned to this worker that are still in-progress / assigned
    const activeJobs = assignedTasks.filter(
        (t) => t.status === 'assigned' || t.status === 'in_progress'
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.welcomeText}>
                        <h1>{greeting}, {user.name || user.displayName || 'Worker'}!</h1>
                        <p>
                            {dataLoading
                                ? 'Loading your jobs...'
                                : `You have ${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''}.`
                            }
                        </p>
                    </div>

                    <div className={styles.statusToggle}>
                        <span className={`${styles.statusLabel} ${isOnline ? styles.statusOnline : styles.statusOffline}`}>
                            {isOnline ? 'Online & Ready' : 'Offline'}
                        </span>
                        <div
                            className={`${styles.toggleSwitch} ${isOnline ? styles.active : ''}`}
                            onClick={() => setIsOnline(!isOnline)}
                        >
                            <div className={styles.toggleKnob}></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                {/* ── Stats Cards ──────────────────────────────────────────────── */}
                <div className={styles.metricsGrid}>
                    <Card className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ color: 'var(--success)', background: '#ecfdf5' }}>
                            <FaCheckCircle />
                        </div>
                        <div className={styles.metricInfo}>
                            <h3>
                                {dataLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : (stats?.jobsCompleted ?? 0)}
                            </h3>
                            <p>Jobs Completed</p>
                        </div>
                    </Card>

                    <Card className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ color: '#f59e0b', background: '#fef3c7' }}>
                            <FaStar />
                        </div>
                        <div className={styles.metricInfo}>
                            <h3>
                                {dataLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : (stats?.averageRating ?? user.rating ?? '—')}
                            </h3>
                            <p>Rating</p>
                        </div>
                    </Card>

                    <Card className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ color: 'var(--primary-blue)', background: '#eff6ff' }}>
                            <FaMoneyBillWave />
                        </div>
                        <div className={styles.metricInfo}>
                            <h3>
                                {dataLoading
                                    ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                    : stats?.totalEarnings > 0
                                        ? `Rs ${stats.totalEarnings.toLocaleString()}`
                                        : 'Rs 0'
                                }
                            </h3>
                            <p>Total Earnings</p>
                        </div>
                    </Card>
                </div>

                {/* ── Error banner ──────────────────────────────────────────────── */}
                {dataError && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fca5a5',
                        borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                        color: '#dc2626', fontSize: 14,
                    }}>
                        ⚠️ Could not load live data: {dataError}. Showing cached or empty state.
                    </div>
                )}

                {/* ── Active / Assigned Jobs Section ─────────────────────────── */}
                <section className={styles.requestsSection}>
                    <h2>My Active Jobs</h2>
                    <p className={styles.subtitle}>
                        {isOnline
                            ? 'Jobs currently assigned to you.'
                            : 'Go online to receive new requests in your area.'}
                    </p>

                    <div className={styles.requestsList}>
                        {dataLoading ? (
                            <div className={styles.emptyState}>
                                <FaSpinner size={32} color="#94a3b8" style={{ animation: 'spin 1s linear infinite' }} />
                                <div>Loading your jobs...</div>
                            </div>
                        ) : !isOnline ? (
                            <div className={styles.emptyState}>
                                <FaWifi size={48} color="#cbd5e1" />
                                <div>You are currently offline.</div>
                                <Button size="small" onClick={() => setIsOnline(true)}>Go Online</Button>
                            </div>
                        ) : activeJobs.length === 0 ? (
                            <div className={styles.emptyState}>
                                No active jobs right now. Stay online to receive new assignments!
                            </div>
                        ) : (
                            activeJobs.map((task) => (
                                <Card key={task._id} className={`${styles.requestCard} ${task.urgency === 'high' ? styles.urgent : ''}`}>
                                    <div className={styles.reqTop}>
                                        <div>
                                            <h3 className={styles.reqTitle}>
                                                {task.title}
                                                {task.urgency === 'high' && <span className={styles.urgentBadge}>Urgent</span>}
                                                {task.urgency === 'critical' && <span className={styles.urgentBadge}>Critical</span>}
                                            </h3>
                                            <p className={styles.reqLocation}>
                                                <FaMapMarkerAlt />
                                                {task.client_id?.name || 'Client'} •{' '}
                                                {task.location
                                                    ? `${task.location.lat?.toFixed(2)}°N, ${task.location.lng?.toFixed(2)}°E`
                                                    : 'Location unknown'}
                                            </p>
                                        </div>
                                        <div className={styles.reqPrice}>
                                            <span className={styles.statusBadge} style={{
                                                background: task.status === 'in_progress' ? '#dbeafe' : '#fef9c3',
                                                color: task.status === 'in_progress' ? '#1d4ed8' : '#854d0e',
                                            }}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                                        {task.description}
                                    </p>
                                    <div className={styles.reqActions}>
                                        <Button style={{ flex: 1 }} onClick={() => handleAcceptJob(task._id)}>
                                            View Job
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                {/* ── All Tasks History ─────────────────────────────────────────── */}
                {!dataLoading && assignedTasks.length > 0 && (
                    <section className={styles.requestsSection}>
                        <h2>Task History ({assignedTasks.length})</h2>
                        <div className={styles.requestsList}>
                            {assignedTasks
                                .filter((t) => t.status === 'completed' || t.status === 'cancelled')
                                .slice(0, 5)
                                .map((task) => (
                                    <Card key={task._id} className={styles.requestCard} style={{ opacity: 0.8 }}>
                                        <div className={styles.reqTop}>
                                            <div>
                                                <h3 className={styles.reqTitle}>{task.title}</h3>
                                                <p className={styles.reqLocation}>
                                                    <FaMapMarkerAlt /> {task.client_id?.name || 'Client'} • {task.category}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 600, padding: '4px 10px',
                                                    borderRadius: 20,
                                                    background: task.status === 'completed' ? '#dcfce7' : '#fee2e2',
                                                    color: task.status === 'completed' ? '#16a34a' : '#dc2626',
                                                }}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    </section>
                )}

                {/* ── Quick Actions ─────────────────────────────────────────────── */}
                <section className={styles.actionsSection}>
                    <h2>Quick Actions</h2>
                    <div className={styles.actionGrid}>
                        <Button variant="outline" onClick={() => router.push('/worker/profile')}>
                            Update Profile & Documents
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/worker/earnings')}>
                            View Earnings History
                        </Button>
                        <Button variant="outline" onClick={fetchDashboardData}>
                            🔄 Refresh Dashboard
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
}
