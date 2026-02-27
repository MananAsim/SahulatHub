'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading, role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            const isAuthPage = pathname.includes('/auth/login') || pathname.includes('/auth/signup') || pathname === '/login' || pathname === '/signup';
            const isProtectedRoute = pathname.startsWith('/client') || pathname.startsWith('/worker');

            if (!user && isProtectedRoute) {
                // If user not authenticated and tries to access protected route, redirect to login
                router.push('/auth/login?role=client');
            } else if (user && isAuthPage) {
                // Prevent logged-in users from visiting login/signup pages
                router.push(role === 'client' ? '/client/dashboard' : '/worker/dashboard');
            }
        }
    }, [user, loading, router, pathname, role]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style jsx>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    // Optionally handle the visual gap where user is null but pathname IS a protected route
    const isProtectedRoute = pathname.startsWith('/client') || pathname.startsWith('/worker');
    if (!user && isProtectedRoute) {
        return null; // Prevents flashing protected content before redirect
    }

    return <>{children}</>;
}
