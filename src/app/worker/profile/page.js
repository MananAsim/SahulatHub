'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ReviewModal from '@/components/ReviewModal';
import styles from './page.module.css';
import {
    FaArrowLeft, FaStar, FaUserEdit, FaToolbox, FaPhoneAlt,
    FaEnvelope, FaMapMarkerAlt, FaSignOutAlt, FaSpinner, FaToggleOn, FaToggleOff,
} from 'react-icons/fa';

const ALL_SKILLS = ['Plumbing', 'Electrical', 'AC Repair', 'Carpentry', 'Painting', 'Cleaning'];

export default function WorkerProfile() {
    const { user, logout, loading, setUser } = useAuth();
    const router = useRouter();

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [availToggling, setAvailToggling] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editSkills, setEditSkills] = useState([]);
    const [reviewModal, setReviewModal] = useState(null); // { taskId } — unused on profile page

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login?role=worker');
    }, [user, loading, router]);

    // Load real reviews from the backend
    useEffect(() => {
        if (!user) return;
        apiFetch('/api/reviews/received')
            .then((res) => setReviews(res.data || []))
            .catch(() => setReviews([]))
            .finally(() => setReviewsLoading(false));
    }, [user]);

    // Seed edit form from user
    useEffect(() => {
        if (user) {
            setEditName(user.name || '');
            setEditSkills(user.skills || []);
        }
    }, [user]);

    if (loading || !user) return <div className="section text-center">Loading profile...</div>;

    const handleToggleAvailability = async () => {
        setAvailToggling(true);
        try {
            const res = await apiFetch('/api/workers/me/availability', { method: 'PATCH' });
            // Update local user context so the UI reflects immediately
            if (setUser) setUser((prev) => ({ ...prev, availability: res.data.availability }));
        } catch (err) {
            console.error('Availability toggle error:', err.message);
        } finally {
            setAvailToggling(false);
        }
    };

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        setProfileMsg('');
        try {
            const res = await apiFetch('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ name: editName, skills: editSkills }),
            });
            if (setUser) setUser((prev) => ({ ...prev, name: res.data.name, skills: res.data.skills }));
            setProfileMsg('Profile updated!');
            setEditMode(false);
        } catch (err) {
            setProfileMsg(err.message || 'Failed to save profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const toggleSkill = (skill) => {
        setEditSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const isOnline = user.availability !== false;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button className={styles.backButton} onClick={() => router.push('/worker/dashboard')}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1>Worker Profile</h1>
                    <p>Manage your services, details, and view client feedback.</p>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.profileGrid}>
                    {/* ── Left column ────────────────────────────────────────── */}
                    <div className={styles.leftCol}>
                        <Card className={styles.userCard}>
                            <div className={styles.avatarLarge}>
                                {(user.name || 'W').charAt(0).toUpperCase()}
                            </div>
                            <h2 className={styles.userName}>{user.name || 'Worker'}</h2>

                            <div className={styles.ratingBadge}>
                                <FaStar style={{ color: '#f59e0b' }} />
                                {user.rating != null ? Number(user.rating).toFixed(1) : '—'} Rating
                            </div>

                            {/* Availability toggle */}
                            <div
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    margin: '12px 0', cursor: availToggling ? 'wait' : 'pointer',
                                }}
                                onClick={availToggling ? undefined : handleToggleAvailability}
                                title="Toggle your availability"
                            >
                                {availToggling ? (
                                    <FaSpinner style={{ animation: 'spin 1s linear infinite', color: '#64748b' }} />
                                ) : isOnline ? (
                                    <FaToggleOn size={28} style={{ color: '#16a34a' }} />
                                ) : (
                                    <FaToggleOff size={28} style={{ color: '#94a3b8' }} />
                                )}
                                <span style={{ fontSize: 14, fontWeight: 600, color: isOnline ? '#16a34a' : '#94a3b8' }}>
                                    {isOnline ? 'Online & Available' : 'Offline'}
                                </span>
                            </div>

                            <div className={styles.contactInfo}>
                                {user.phone && (
                                    <div className={styles.contactItem}>
                                        <FaPhoneAlt className={styles.contactIcon} />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                {user.email && (
                                    <div className={styles.contactItem}>
                                        <FaEnvelope className={styles.contactIcon} />
                                        <span>{user.email}</span>
                                    </div>
                                )}
                                {user.location && (user.location.lat !== 0 || user.location.lng !== 0) && (
                                    <div className={styles.contactItem}>
                                        <FaMapMarkerAlt className={styles.contactIcon} />
                                        <span>{user.location.lat?.toFixed(4)}°N, {user.location.lng?.toFixed(4)}°E</span>
                                    </div>
                                )}
                            </div>

                            <Button variant="outline" className={styles.editBtn} onClick={() => setEditMode(!editMode)}>
                                <FaUserEdit /> {editMode ? 'Cancel Edit' : 'Edit Details'}
                            </Button>
                        </Card>

                        <Card className={styles.actionCard}>
                            <Button variant="outline" className={styles.logoutBtn} onClick={handleLogout}>
                                <FaSignOutAlt /> Sign Out
                            </Button>
                        </Card>
                    </div>

                    {/* ── Right column ───────────────────────────────────────── */}
                    <div className={styles.rightCol}>
                        {/* Edit profile form */}
                        {editMode && (
                            <Card className={styles.servicesCard} style={{ marginBottom: 16 }}>
                                <h3 style={{ marginBottom: 12 }}><FaUserEdit style={{ marginRight: 6 }} />Edit Profile</h3>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
                                    />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Skills</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {ALL_SKILLS.map((sk) => (
                                            <span
                                                key={sk}
                                                onClick={() => toggleSkill(sk)}
                                                style={{
                                                    padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                                                    fontWeight: 600, border: '1px solid',
                                                    background: editSkills.includes(sk) ? '#ede9fe' : '#f8fafc',
                                                    borderColor: editSkills.includes(sk) ? '#7c3aed' : '#e2e8f0',
                                                    color: editSkills.includes(sk) ? '#7c3aed' : '#64748b',
                                                }}
                                            >{sk}</span>
                                        ))}
                                    </div>
                                </div>
                                {profileMsg && (
                                    <p style={{ fontSize: 13, color: profileMsg.includes('!') ? '#16a34a' : '#dc2626', marginBottom: 10 }}>
                                        {profileMsg}
                                    </p>
                                )}
                                <Button onClick={handleSaveProfile} disabled={profileSaving}>
                                    {profileSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Card>
                        )}

                        {/* Services / Skills display */}
                        <Card className={styles.servicesCard}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3><FaToolbox className={styles.sectionIcon} /> My Skills & Services</h3>
                                    <p>Services you offer to clients.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                {(user.skills || []).length === 0 ? (
                                    <p style={{ color: '#94a3b8', fontSize: 13 }}>No skills listed yet. Click "Edit Details" to add some.</p>
                                ) : (
                                    (user.skills || []).map((sk) => (
                                        <span key={sk} style={{
                                            padding: '4px 14px', borderRadius: 20,
                                            background: '#ede9fe', color: '#7c3aed', fontWeight: 600, fontSize: 13,
                                        }}>{sk}</span>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Reviews */}
                        <Card className={styles.reviewsCard}>
                            <div className={styles.sectionHeader}>
                                <h3>Client Feedback</h3>
                                <p>Reviews from your completed jobs.</p>
                            </div>

                            <div className={styles.reviewsList}>
                                {reviewsLoading ? (
                                    <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>
                                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Loading reviews...
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <p style={{ color: '#94a3b8', fontSize: 14, padding: '8px 0' }}>
                                        No reviews yet — complete more jobs to build your reputation!
                                    </p>
                                ) : (
                                    reviews.map((rev) => (
                                        <div key={rev._id} className={styles.reviewItem}>
                                            <div className={styles.reviewTop}>
                                                <span className={styles.reviewerName}>
                                                    {rev.reviewer_id?.name || 'Client'}
                                                </span>
                                                <span className={styles.reviewDate}>
                                                    {new Date(rev.createdAt).toLocaleDateString('en-PK', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className={styles.reviewStars}>
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} color={i < rev.rating ? '#f59e0b' : '#e2e8f0'} />
                                                ))}
                                            </div>
                                            {rev.comment && (
                                                <p className={styles.reviewText}>"{rev.comment}"</p>
                                            )}
                                            {rev.task_id?.title && (
                                                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                                    Job: {rev.task_id.title}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
