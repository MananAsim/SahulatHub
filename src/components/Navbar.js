'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, role, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getDashboardLink = () => {
        if (role === 'client') return '/client/dashboard';
        if (role === 'worker') return '/worker/dashboard';
        if (role === 'admin') return '/admin';
        return '/';
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.logo}>
                        SahulatHub
                    </Link>
                    <div className={styles.links}>
                        {!mounted ? null : role === 'worker' ? (
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <Link href="/worker/dashboard" className={styles.link}>Dashboard</Link>
                                <Link href="/worker/profile" className={styles.link}>My Profile</Link>
                            </div>
                        ) : role === 'client' ? (
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <Link href="/client/dashboard" className={styles.link}>Dashboard</Link>
                                <Link href="/client/book" className={styles.link}>Book Service</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <Link href="/" className={styles.link}>Home</Link>
                                <Link href="/#services" className={styles.link}>Services</Link>
                                <Link href="/about" className={styles.link}>About Us</Link>
                                <Link href="/contact" className={styles.link}>Contact</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.navRight}>
                    {!mounted ? null : user ? (
                        <div className={styles.userMenu}>
                            <span className={styles.greeting}>Hi, {user.name} ({role})</span>
                            <Link href={getDashboardLink()} className={styles.dashboardBtn}>
                                Dashboard
                            </Link>
                            <button onClick={logout} className={styles.logoutBtn}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authLinks}>
                            <Link href="/auth/login" className={styles.loginBtn}>
                                Login / Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
