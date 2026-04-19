'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * /auth/callback
 *
 * This page receives the post-OAuth redirect from the backend.
 * The backend sends:  /auth/callback?token=JWT&role=client|worker
 *
 * We store the token + role, then fetch the user profile from /api/auth/me
 * to get the full user object before redirecting to the dashboard.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role') || localStorage.getItem('sahulat_oauth_role') || 'client';
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            router.replace(`/auth/login?error=${encodeURIComponent(error)}`);
            return;
        }

        if (!token) {
            router.replace('/auth/login?error=missing_token');
            return;
        }

        const finalizeSession = async () => {
            try {
                // Fetch the full user profile from the backend using the received token
                const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch user profile');

                const data = await res.json();
                const userData = data.data;

                // Persist session identically to how login() does it in AuthContext
                localStorage.setItem('sahulat_token', token);
                localStorage.setItem('sahulat_user_temp', JSON.stringify(userData));
                localStorage.setItem('sahulat_role', userData.role || role);
                localStorage.removeItem('sahulat_oauth_role');

                // Redirect to the appropriate dashboard
                const destination = userData.role === 'worker' ? '/worker/dashboard' : '/client/dashboard';
                router.replace(destination);
            } catch (err) {
                console.error('Session finalization error:', err);
                router.replace('/auth/login?error=session_error');
            }
        };

        finalizeSession();
    }, [searchParams, router]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '16px',
            fontFamily: 'system-ui, sans-serif',
            background: 'var(--bg-primary, #0f172a)',
            color: 'var(--text-primary, #f8fafc)',
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(99,102,241,0.3)',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Completing sign-in…</p>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <p>Loading...</p>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
