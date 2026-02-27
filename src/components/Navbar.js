'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, role, logout } = useAuth();

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
                        <Link href="/" className={styles.link}>Home</Link>
                        <Link href="/#services" className={styles.link}>Services</Link>
                        <Link href="/about" className={styles.link}>About Us</Link>
                        <Link href="/contact" className={styles.link}>Contact</Link>
                    </div>
                </div>

                <div className={styles.navRight}>
                    {user ? (
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
