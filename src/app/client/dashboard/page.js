'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';
import Card from '@/components/Card';
import Button from '@/components/Button';
import AIChatbot from '@/components/AIChatbot';
import styles from './page.module.css';
import {
    FaWrench, FaBolt, FaSnowflake, FaBroom, FaPaintRoller,
    FaHammer, FaSearch, FaSpinner,
} from 'react-icons/fa';

const SERVICES = [
    { title: 'Plumbing', icon: FaWrench, desc: 'Leakages, installations' },
    { title: 'Electrical', icon: FaBolt, desc: 'Wiring, appliances' },
    { title: 'AC Repair', icon: FaSnowflake, desc: 'Installation, servicing' },
    { title: 'Cleaning', icon: FaBroom, desc: 'Deep cleaning, housekeeping' },
    { title: 'Painting', icon: FaPaintRoller, desc: 'Interior & exterior' },
    { title: 'Carpentry', icon: FaHammer, desc: 'Furniture repair' },
];

const STATUS_COLOR = {
    open: '#3b82f6',
    assigned: '#f59e0b',
    in_progress: '#8b5cf6',
    completed: '#16a34a',
    cancelled: '#dc2626',
};

export default function ClientDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentTasks, setRecentTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!user || role !== 'client')) {
            router.push('/auth/login?role=client');
        }
    }, [user, role, loading, router]);

    const fetchTasks = useCallback(async () => {
        setTasksLoading(true);
        try {
            const res = await apiFetch('/api/tasks/my');
            setRecentTasks((res.data || []).slice(0, 4)); // show last 4
        } catch {
            setRecentTasks([]);
        } finally {
            setTasksLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!loading && user) fetchTasks();
    }, [loading, user, fetchTasks]);

    if (loading || !user) return <div className="section text-center">Loading dashboard...</div>;

    const filteredServices = SERVICES.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookService = (serviceTitle) => router.push(`/client/book?service=${serviceTitle}`);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>Welcome back, {user.name}!</h1>
                    <p>What service do you need today?</p>

                    <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search for a service..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                {/* Services grid */}
                <section className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                        <h2>Available Services</h2>
                    </div>
                    <div className={styles.servicesGrid}>
                        {filteredServices.map((srv, idx) => (
                            <ServiceCard
                                key={idx}
                                title={srv.title}
                                icon={srv.icon}
                                description={srv.desc}
                                onClick={() => handleBookService(srv.title)}
                            />
                        ))}
                    </div>
                </section>

                {/* Real recent bookings from DB */}
                <section className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                        <h2>Recent Bookings</h2>
                        <Button variant="text" onClick={fetchTasks} title="Refresh">
                            🔄 Refresh
                        </Button>
                    </div>

                    <div className={styles.bookingsList}>
                        {tasksLoading ? (
                            <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading...
                            </div>
                        ) : recentTasks.length === 0 ? (
                            <Card className={styles.bookingCard} style={{ color: '#94a3b8', justifyContent: 'center' }}>
                                No bookings yet — book your first service above!
                            </Card>
                        ) : (
                            recentTasks.map((task) => (
                                <Card key={task._id} className={styles.bookingCard}>
                                    <div className={styles.bookingInfo}>
                                        <div className={styles.bookingIcon} style={{ color: STATUS_COLOR[task.status] || '#64748b' }}>
                                            {SERVICES.find((s) => s.title.toLowerCase() === task.category?.toLowerCase())
                                                ? (() => {
                                                    const svc = SERVICES.find((s) => s.title.toLowerCase() === task.category?.toLowerCase());
                                                    const Icon = svc.icon;
                                                    return <Icon />;
                                                })()
                                                : <FaWrench />}
                                        </div>
                                        <div>
                                            <h3>{task.title}</h3>
                                            <p>
                                                {new Date(task.createdAt).toLocaleDateString('en-PK', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                                {' • '}
                                                <span style={{ fontWeight: 600, color: STATUS_COLOR[task.status] }}>
                                                    {task.status?.replace('_', ' ')}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => router.push(`/client/job/${task._id}`)}
                                    >
                                        {task.status === 'completed' ? 'View' : 'Track'}
                                    </Button>
                                </Card>
                            ))
                        )}
                    </div>
                </section>
            </main>
            <AIChatbot role="client" />
        </div>
    );
}
