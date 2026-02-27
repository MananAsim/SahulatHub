'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ServiceCard from '@/components/ServiceCard';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import {
    FaWrench, FaBolt, FaSnowflake, FaBroom, FaPaintRoller, FaHammer, FaSearch
} from 'react-icons/fa';

export default function ClientDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!loading && (!user || role !== 'client')) {
            router.push('/auth/login?role=client');
        }
    }, [user, role, loading, router]);

    if (loading || !user) return <div className="section text-center">Loading dashboard...</div>;

    const services = [
        { title: 'Plumbing', icon: FaWrench, desc: 'Leakages, installations' },
        { title: 'Electrical', icon: FaBolt, desc: 'Wiring, appliances' },
        { title: 'AC Repair', icon: FaSnowflake, desc: 'Installation, servicing' },
        { title: 'Cleaning', icon: FaBroom, desc: 'Deep cleaning, housekeeping' },
        { title: 'Painting', icon: FaPaintRoller, desc: 'Interior & exterior' },
        { title: 'Carpentry', icon: FaHammer, desc: 'Furniture repair' },
    ].filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleBookService = (serviceTitle) => {
        router.push(`/client/book?service=${serviceTitle}`);
    };

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
                <section className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                        <h2>Available Services</h2>
                        <Button variant="text">View All</Button>
                    </div>

                    <div className={styles.servicesGrid}>
                        {services.map((srv, idx) => (
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

                <section className={styles.sectionBlock}>
                    <h2>Recent Bookings</h2>
                    <div className={styles.bookingsList}>
                        <Card className={styles.bookingCard}>
                            <div className={styles.bookingInfo}>
                                <div className={styles.bookingIcon}><FaSnowflake /></div>
                                <div>
                                    <h3>AC Servicing</h3>
                                    <p>Mar 12, 2026 • Completed</p>
                                </div>
                            </div>
                            <Button variant="outline" size="small">Rebook</Button>
                        </Card>

                        <Card className={styles.bookingCard}>
                            <div className={styles.bookingInfo}>
                                <div className={styles.bookingIcon}><FaBolt /></div>
                                <div>
                                    <h3>Ceiling Fan Installation</h3>
                                    <p>Mar 5, 2026 • Completed</p>
                                </div>
                            </div>
                            <Button variant="outline" size="small">Rebook</Button>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    );
}
