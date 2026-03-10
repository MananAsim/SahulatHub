'use client';

import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaUsers, FaClipboardList, FaStar, FaSpinner } from 'react-icons/fa';

export default function AdminDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({ users: 0, tasks: 0, workers: 0, completedJobs: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!user || role !== 'admin')) {
            router.push('/auth/login?role=admin');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (!loading && user && role === 'admin') {
            Promise.all([
                apiFetch('/api/dev/users').catch(() => ({ data: [] })),
                apiFetch('/api/dev/tasks').catch(() => ({ data: [] })),
            ]).then(([usersRes, tasksRes]) => {
                const users = usersRes.data || [];
                const tasks = tasksRes.data || [];
                const workers = users.filter((u) => u.role === 'worker');
                const completed = tasks.filter((t) => t.status === 'completed');

                setStats({
                    users: users.length,
                    tasks: tasks.length,
                    workers: workers.length,
                    completedJobs: completed.length,
                });

                // 5 most recent tasks
                setRecentTasks(
                    [...tasks]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                );

                // 5 most recently registered users
                setRecentUsers(
                    [...users]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                );
            }).finally(() => setDataLoading(false));
        }
    }, [loading, user, role]);

    if (loading || !user || role !== 'admin') {
        return <div className="section text-center">Loading Admin Panel...</div>;
    }

    const STATUS_COLOR = {
        open: '#3b82f6', assigned: '#f59e0b',
        in_progress: '#8b5cf6', completed: '#16a34a', cancelled: '#dc2626',
    };

    const ROLE_COLOR = { client: '#3b82f6', worker: '#16a34a', admin: '#7c3aed' };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>Admin Control Panel</h1>
                    <p>Monitor platform activity in real time.</p>
                </div>
            </header>

            <main className={styles.mainContent}>
                {dataLoading ? (
                    <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                        <FaSpinner size={32} style={{ animation: 'spin 1s linear infinite' }} />
                        <p>Loading platform data...</p>
                    </div>
                ) : (
                    <>
                        {/* ── Stats cards ──────────────────────────────────── */}
                        <div className={styles.statsGrid}>
                            <Card className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                                    <FaUsers />
                                </div>
                                <div className={styles.statInfo}>
                                    <h3>{stats.users}</h3>
                                    <p>Total Users</p>
                                </div>
                            </Card>
                            <Card className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                                    <FaClipboardList />
                                </div>
                                <div className={styles.statInfo}>
                                    <h3>{stats.workers}</h3>
                                    <p>Registered Workers</p>
                                </div>
                            </Card>
                            <Card className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                                    <FaClipboardList />
                                </div>
                                <div className={styles.statInfo}>
                                    <h3>{stats.tasks}</h3>
                                    <p>Total Tasks</p>
                                </div>
                            </Card>
                            <Card className={styles.statCard}>
                                <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                                    <FaStar />
                                </div>
                                <div className={styles.statInfo}>
                                    <h3>{stats.completedJobs}</h3>
                                    <p>Completed Jobs</p>
                                </div>
                            </Card>
                        </div>

                        {/* ── Data panels ──────────────────────────────────── */}
                        <div className={styles.panelsGrid}>
                            {/* Recent Tasks */}
                            <section>
                                <h2>Recent Tasks ({recentTasks.length})</h2>
                                <Card className={styles.panelCard}>
                                    <div className={styles.list}>
                                        {recentTasks.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: 14 }}>No tasks yet.</p>
                                        ) : recentTasks.map((t) => (
                                            <div key={t._id} className={styles.listItem}>
                                                <div>
                                                    <h4>{t.title}</h4>
                                                    <p style={{ fontSize: 12, color: '#64748b' }}>
                                                        {t.category} •{' '}
                                                        <span style={{ fontWeight: 600, color: STATUS_COLOR[t.status] }}>
                                                            {t.status?.replace('_', ' ')}
                                                        </span>
                                                    </p>
                                                </div>
                                                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                                    {new Date(t.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </section>

                            {/* Recent Users */}
                            <section>
                                <h2>Recent Users ({recentUsers.length})</h2>
                                <Card className={styles.panelCard}>
                                    <div className={styles.list}>
                                        {recentUsers.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: 14 }}>No users yet.</p>
                                        ) : recentUsers.map((u) => (
                                            <div key={u._id} className={styles.listItem}>
                                                <div>
                                                    <h4>{u.name}</h4>
                                                    <p style={{ fontSize: 12, color: '#64748b' }}>
                                                        {u.email || u.phone}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700, padding: '2px 8px',
                                                    borderRadius: 12, background: '#f1f5f9',
                                                    color: ROLE_COLOR[u.role] || '#64748b',
                                                }}>
                                                    {u.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </section>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
