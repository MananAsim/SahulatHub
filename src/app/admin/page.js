'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaUsers, FaClipboardList, FaFileAlt, FaChartLine } from 'react-icons/fa';

export default function AdminDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    if (loading || !user || role !== 'admin') {
        if (!loading && role !== 'admin') {
            router.push('/auth/login?role=admin');
        }
        return <div className="section text-center">Loading Admin Panel...</div>;
    }

    const verifications = [
        { id: 'v1', name: 'Zain Abbas', type: 'CNIC + Certificate', date: 'Today' },
        { id: 'v2', name: 'Farooq Tariq', type: 'CNIC', date: 'Yesterday' }
    ];

    const disputes = [
        { id: 'd1', job: '#124', client: 'Aisha K.', worker: 'Zain Abbas', issue: 'Overcharged for parts', status: 'Pending' }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>Admin Control Panel</h1>
                    <p>Monitor platform activity, resolve disputes, and verify providers.</p>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.statsGrid}>
                    <Card className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                            <FaUsers />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>1,248</h3>
                            <p>Total Users</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                            <FaClipboardList />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>432</h3>
                            <p>Active Jobs</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                            <FaFileAlt />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>12</h3>
                            <p>Pending Verifications</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
                            <FaChartLine />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>Rs 4.2M</h3>
                            <p>Platform Revenue</p>
                        </div>
                    </Card>
                </div>

                <div className={styles.panelsGrid}>
                    <section>
                        <h2>Pending Verifications</h2>
                        <Card className={styles.panelCard}>
                            <div className={styles.list}>
                                {verifications.map(v => (
                                    <div key={v.id} className={styles.listItem}>
                                        <div>
                                            <h4>{v.name}</h4>
                                            <p>{v.type} • Submitted {v.date}</p>
                                        </div>
                                        <div className={styles.actions}>
                                            <Button variant="outline" size="small">Reject</Button>
                                            <Button size="small">Approve</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2>Active Disputes</h2>
                        <Card className={styles.panelCard}>
                            <div className={styles.list}>
                                {disputes.map(d => (
                                    <div key={d.id} className={styles.listItem}>
                                        <div>
                                            <h4>Job {d.job}: {d.issue}</h4>
                                            <p>{d.client} vs {d.worker}</p>
                                        </div>
                                        <Button variant="secondary" size="small">Review</Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}
