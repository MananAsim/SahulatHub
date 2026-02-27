'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaArrowLeft, FaStar, FaUserEdit, FaToolbox, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaSignOutAlt } from 'react-icons/fa';

export default function WorkerProfile() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    const [services, setServices] = useState([
        { id: 's1', name: 'Plumbing', enabled: true },
        { id: 's2', name: 'Electrical', enabled: true },
        { id: 's3', name: 'AC Repair', enabled: false },
        { id: 's4', name: 'Carpentry', enabled: false },
        { id: 's5', name: 'Painting', enabled: false },
    ]);

    if (loading || !user) return <div className="section text-center">Loading profile...</div>;

    const toggleService = (id) => {
        setServices(services.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const reviews = [
        { id: 'r1', author: 'Ahmed Raza', rating: 5, date: 'Oct 24, 2026', comment: 'Excellent and quick plumbing repair. Very professional!' },
        { id: 'r2', author: 'Fatima Ali', rating: 4, date: 'Oct 22, 2026', comment: 'Good work on the AC servicing, but arrived 10 mins late.' }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button className={styles.backButton} onClick={() => router.push('/worker/dashboard')}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1>Worker Profile</h1>
                    <p>Manage your services, details, and view feedback.</p>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.profileGrid}>
                    <div className={styles.leftCol}>
                        <Card className={styles.userCard}>
                            <div className={styles.avatarLarge}>
                                {user.displayName ? user.displayName.charAt(0) : (user.name ? user.name.charAt(0) : 'W')}
                            </div>
                            <h2 className={styles.userName}>{user.displayName || user.name || 'Worker'}</h2>
                            <div className={styles.ratingBadge}>
                                <FaStar /> 4.8 Rating
                            </div>

                            <div className={styles.contactInfo}>
                                <div className={styles.contactItem}>
                                    <FaPhoneAlt className={styles.contactIcon} />
                                    <span>{user.phoneNumber || '+92 300 1234567'}</span>
                                </div>
                                {user.email && (
                                    <div className={styles.contactItem}>
                                        <FaEnvelope className={styles.contactIcon} />
                                        <span>{user.email.includes('@worker.') ? 'Hidden Email' : user.email}</span>
                                    </div>
                                )}
                                <div className={styles.contactItem}>
                                    <FaMapMarkerAlt className={styles.contactIcon} />
                                    <span>Lahore, Pakistan</span>
                                </div>
                            </div>

                            <Button variant="outline" className={styles.editBtn}>
                                <FaUserEdit /> Edit Details
                            </Button>
                        </Card>

                        <Card className={styles.actionCard}>
                            <Button variant="outline" className={styles.logoutBtn} onClick={handleLogout}>
                                <FaSignOutAlt /> Sign Out
                            </Button>
                        </Card>
                    </div>

                    <div className={styles.rightCol}>
                        <Card className={styles.servicesCard}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3><FaToolbox className={styles.sectionIcon} /> My Services</h3>
                                    <p>Select the jobs you want to receive requests for.</p>
                                </div>
                            </div>

                            <div className={styles.servicesList}>
                                {services.map(srv => (
                                    <div key={srv.id} className={styles.serviceRow}>
                                        <span className={styles.serviceName}>{srv.name}</span>
                                        <div
                                            className={`${styles.toggleSwitch} ${srv.enabled ? styles.activeSwitch : ''}`}
                                            onClick={() => toggleService(srv.id)}
                                        >
                                            <div className={styles.toggleKnob}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className={styles.reviewsCard}>
                            <div className={styles.sectionHeader}>
                                <h3>Client Feedback</h3>
                                <p>Recent reviews from your completed jobs.</p>
                            </div>

                            <div className={styles.reviewsList}>
                                {reviews.map(rev => (
                                    <div key={rev.id} className={styles.reviewItem}>
                                        <div className={styles.reviewTop}>
                                            <span className={styles.reviewerName}>{rev.author}</span>
                                            <span className={styles.reviewDate}>{rev.date}</span>
                                        </div>
                                        <div className={styles.reviewStars}>
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} color={i < rev.rating ? '#f59e0b' : '#e2e8f0'} />
                                            ))}
                                        </div>
                                        <p className={styles.reviewText}>"{rev.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
