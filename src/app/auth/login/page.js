'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import styles from './page.module.css';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState(searchParams.get('role') || 'client');
    const [isLogin, setIsLogin] = useState(true);

    // Client states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clientLoading, setClientLoading] = useState(false);
    const [clientError, setClientError] = useState('');

    // Worker states
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [workerLoading, setWorkerLoading] = useState(false);
    const [workerError, setWorkerError] = useState('');

    const {
        login, register,
        loginWithFacebook, loginWithGoogle,
        initializeRecaptcha, sendVerificationCode, verifyOTP,
        registerWorkerWithPassword, loginWorkerWithPassword,
    } = useAuth();

    // Reset states when switching roles or login/signup mode
    const handleRoleSwitch = (newRole) => {
        setRole(newRole);
        setClientError('');
        setWorkerError('');
        setOtpSent(false);
    };

    const handleModeSwitch = () => {
        setIsLogin(!isLogin);
        setClientError('');
        setWorkerError('');
        setOtpSent(false);
        setName('');
        setEmail('');
        setPassword('');
    };

    // --- Client Handlers ---
    const handleClientEmailSubmit = async (e) => {
        e.preventDefault();
        setClientLoading(true);
        setClientError('');
        try {
            if (isLogin) {
                // LOGIN flow
                await login(email, password);
            } else {
                // SIGNUP flow
                if (!name.trim()) {
                    setClientError('Full name is required.');
                    setClientLoading(false);
                    return;
                }
                await register({ name: name.trim(), email, password, role: 'client' });
            }
            const redirect = searchParams.get('redirect');
            router.push(redirect ? redirect : '/client/dashboard');
        } catch (error) {
            console.error('Client Auth Error', error);
            setClientError(error.message || (isLogin ? 'Invalid email or password.' : 'Registration failed. Please try again.'));
        } finally {
            setClientLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setClientLoading(true);
        setClientError('');
        try {
            await loginWithFacebook(role);
            // loginWithFacebook now redirects the browser to OAuth; no router.push needed here
        } catch (error) {
            console.error('FB Login Error', error);
            setClientError('Failed to authenticate with Facebook.');
            setClientLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setClientLoading(true);
        setClientError('');
        try {
            await loginWithGoogle(role);
            // loginWithGoogle now redirects the browser to OAuth; no router.push needed here
        } catch (error) {
            console.error('Google Login Error', error);
            setClientError('Failed to authenticate with Google.');
            setClientLoading(false);
        }
    };

    // --- Worker Handlers ---
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setWorkerLoading(true);
        setWorkerError('');
        try {
            initializeRecaptcha('recaptcha-wrapper');
            // Format phone number (dummy simplistic valid format check)
            const formattedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0+/, '')}`;
            await sendVerificationCode(formattedPhone, role);
            setOtpSent(true);
        } catch (error) {
            console.error('OTP Send Error', error);
            setWorkerError('Failed to send OTP. Ensure number is in correct format (e.g., +923...).');
        } finally {
            setWorkerLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setWorkerLoading(true);
        setWorkerError('');
        try {
            await verifyOTP(otp);
            const redirect = searchParams.get('redirect');
            router.push(redirect ? redirect : '/worker/dashboard');
        } catch (error) {
            console.error('OTP Verify Error', error);
            setWorkerError('Invalid OTP code.');
        } finally {
            setWorkerLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <div className={styles.roleTabs}>
                    <button
                        className={`${styles.tab} ${role === 'client' ? styles.activeTab : ''}`}
                        onClick={() => handleRoleSwitch('client')}
                    >
                        Client Mode
                    </button>
                    <button
                        className={`${styles.tab} ${role === 'worker' ? styles.activeTab : ''}`}
                        onClick={() => handleRoleSwitch('worker')}
                    >
                        Worker Mode
                    </button>
                </div>

                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {isLogin ? 'Welcome Back' : 'Create an Account'}
                    </h1>
                    <p className={styles.subtitle}>
                        {role === 'client' ? 'Find the best professionals' : 'Start earning with SahulatHub'}
                    </p>
                </div>

                {/* Recaptcha Container for Phone Auth */}
                <div id="recaptcha-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}></div>

                {role === 'client' ? (
                    // CLIENT FORM
                    <form onSubmit={handleClientEmailSubmit} className={styles.form}>
                        {!isLogin && (
                            <div className={styles.inputGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                required
                                value={email || ''}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                required
                                value={password || ''}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit" size="large" className={styles.submitBtn} disabled={clientLoading}>
                            {clientLoading
                                ? (isLogin ? 'Logging in...' : 'Signing up...')
                                : (isLogin ? 'Login' : 'Sign Up')}
                        </Button>

                        <div className={styles.divider}>
                            <span>OR</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={handleFacebookLogin}
                                disabled={clientLoading}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                    fontWeight: '500', backgroundColor: '#1877F2', color: 'white', padding: '12px 24px',
                                    borderRadius: '8px', border: 'none', cursor: clientLoading ? 'not-allowed' : 'pointer',
                                    opacity: clientLoading ? 0.7 : 1, fontSize: '1rem'
                                }}
                            >
                                {clientLoading ? 'Waiting...' : 'Continue with Facebook'}
                            </button>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={clientLoading}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                    fontWeight: '500', backgroundColor: 'white', color: '#333', padding: '12px 24px',
                                    borderRadius: '8px', border: '1px solid #ddd', cursor: clientLoading ? 'not-allowed' : 'pointer',
                                    opacity: clientLoading ? 0.7 : 1, fontSize: '1rem'
                                }}
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} />
                                {clientLoading ? 'Waiting...' : 'Continue with Google'}
                            </button>
                        </div>

                        {clientError && (
                            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '8px', textAlign: 'center' }}>
                                {clientError}
                            </p>
                        )}
                    </form>
                ) : (
                    // WORKER FORM
                    isLogin ? (
                        // Worker Login Flow (Phone + Password Only, No OTP)
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setWorkerLoading(true);
                            setWorkerError('');
                            try {
                                const formattedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0+/, '')}`;
                                await loginWorkerWithPassword(formattedPhone, password, role);
                                const redirect = searchParams.get('redirect');
                                router.push(redirect ? redirect : '/worker/dashboard');
                            } catch (error) {
                                console.error('Worker Login Error', error);
                                setWorkerError('Invalid phone number or password.');
                            } finally {
                                setWorkerLoading(false);
                            }
                        }} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="+923001234567"
                                    required
                                    value={phone || ''}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <small style={{ color: 'var(--text-muted)' }}>Required format: +92...</small>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="worker-password">Password</label>
                                <input
                                    type="password"
                                    id="worker-password"
                                    placeholder="••••••••"
                                    required
                                    value={password || ''}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <Button type="submit" size="large" className={styles.submitBtn} disabled={workerLoading}>
                                {workerLoading ? 'Logging in...' : 'Login'}
                            </Button>
                            {workerError && (
                                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '8px', textAlign: 'center' }}>
                                    {workerError}
                                </p>
                            )}
                        </form>
                    ) : (
                        // Worker Sign Up Flow (OTP Verification -> Create Password)
                        !otpSent ? (
                            <form onSubmit={handleSendOTP} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="name">Full Name</label>
                                    <input type="text" id="name" placeholder="John Doe" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="cnicFront">Front side picture of CNIC <span style={{ color: 'red' }}>*</span></label>
                                    <input type="file" id="cnicFront" accept="image/*" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="cnicBack">Back side picture of CNIC <span style={{ color: 'red' }}>*</span></label>
                                    <input type="file" id="cnicBack" accept="image/*" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="liveSelfie">Live Selfie <span style={{ color: 'red' }}>*</span></label>
                                    <input type="file" id="liveSelfie" accept="image/*" capture="user" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        placeholder="+923001234567"
                                        required
                                        value={phone || ''}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    <small style={{ color: 'var(--text-muted)' }}>Required format: +92...</small>
                                </div>
                                {!isLogin && (
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="worker-setup-password">Create Password <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="password"
                                            id="worker-setup-password"
                                            placeholder="••••••••"
                                            required
                                            value={password || ''}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <small style={{ color: 'var(--text-muted)' }}>Must be at least 6 characters.</small>
                                    </div>
                                )}

                                <Button type="submit" size="large" className={styles.submitBtn} disabled={workerLoading}>
                                    {workerLoading ? 'Sending...' : 'Send OTP'}
                                </Button>
                                {workerError && (
                                    <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '8px', textAlign: 'center' }}>
                                        {workerError}
                                    </p>
                                )}
                            </form>
                        ) : (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setWorkerLoading(true);
                                setWorkerError('');
                                try {
                                    // 1. Verify OTP first
                                    await verifyOTP(otp);

                                    // 2. Create Password Profile using Email/Password auth mapping
                                    const formattedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0+/, '')}`;
                                    await registerWorkerWithPassword(formattedPhone, password, role);

                                    const redirect = searchParams.get('redirect');
                                    router.push(redirect ? redirect : '/worker/dashboard');
                                } catch (error) {
                                    console.error('Worker Registration OTP/Password Error', error);
                                    if (error.code === 'auth/email-already-in-use') {
                                        setWorkerError('This phone number is already registered. Please login instead.');
                                    } else {
                                        setWorkerError('Invalid OTP or Password constraints not met.');
                                    }
                                } finally {
                                    setWorkerLoading(false);
                                }
                            }} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="otp">Enter OTP</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        placeholder="123456"
                                        required
                                        value={otp || ''}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" size="large" className={styles.submitBtn} disabled={workerLoading}>
                                    {workerLoading ? 'Verifying & Creating...' : 'Verify & Sign Up'}
                                </Button>
                                {workerError && (
                                    <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '8px', textAlign: 'center' }}>
                                        {workerError}
                                    </p>
                                )}
                                <p style={{ textAlign: 'center', marginTop: '12px' }}>
                                    <button type="button" onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', textDecoration: 'underline' }}>
                                        Change Phone Number
                                    </button>
                                </p>
                            </form>
                        )
                    )
                )}

                <p className={styles.switchMode}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button className={styles.switchLink} onClick={handleModeSwitch}>
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
}

// Next.js requires using Suspense for client components accessing useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
