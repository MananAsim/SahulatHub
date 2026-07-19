'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaUserEdit, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

export default function ClientProfile() {
    const { user, role, loading, logout, setUser } = useAuth();
    const router = useRouter();

    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhoto, setEditPhoto] = useState('');
    
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    useEffect(() => {
        if (!loading && (!user || role !== 'client')) {
            router.push('/auth/login?role=client');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (user) {
            setEditName(user.name || '');
            setEditPhoto(user.profilePhoto || '');
        }
    }, [user]);

    if (loading || !user) return <div className="section text-center">Loading profile...</div>;
    if (role !== 'client') return null;

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        setProfileMsg('');
        try {
            const res = await apiFetch('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ name: editName, profilePhoto: editPhoto }),
            });
            if (setUser) setUser((prev) => ({ 
                ...prev, 
                name: res.data.name, 
                profilePhoto: res.data.profilePhoto
            }));
            setProfileMsg('Profile updated successfully!');
            setEditMode(false);
        } catch (err) {
            setProfileMsg(err.message || 'Failed to save profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button className={styles.backButton} onClick={() => router.push('/client/dashboard')}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1>Client Profile</h1>
                    <p>Manage your details.</p>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.profileGrid} style={{ display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '0 auto' }}>
                    <Card className={styles.userCard}>
                        <div className={styles.avatarLarge}>
                            {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                (user.name || 'C').charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className={styles.userName}>{user.name || 'Client'}</h2>

                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <span>{user.email || user.phone}</span>
                            </div>
                        </div>

                        <Button variant="outline" className={styles.editBtn} onClick={() => setEditMode(!editMode)} style={{ marginTop: 16 }}>
                            <FaUserEdit /> {editMode ? 'Cancel Edit' : 'Edit Details'}
                        </Button>
                    </Card>

                    {/* Edit profile form */}
                    {editMode && (
                        <Card className={styles.servicesCard} style={{ marginTop: 16 }}>
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
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Profile Picture URL</label>
                                <input
                                    type="text"
                                    value={editPhoto}
                                    onChange={(e) => setEditPhoto(e.target.value)}
                                    placeholder="https://example.com/photo.jpg"
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
                                />
                            </div>

                            {profileMsg && (
                                <p style={{ fontSize: 13, color: profileMsg.includes('!') ? '#16a34a' : '#dc2626', marginBottom: 16 }}>
                                    {profileMsg}
                                </p>
                            )}
                            <Button onClick={handleSaveProfile} disabled={profileSaving} style={{ width: '100%' }}>
                                {profileSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Card>
                    )}

                    <Card className={styles.actionCard} style={{ marginTop: 16 }}>
                        <Button variant="outline" className={styles.logoutBtn} onClick={handleLogout}>
                            <FaSignOutAlt /> Sign Out
                        </Button>
                    </Card>
                </div>
            </main>
        </div>
    );
}
