'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { apiFetch } from '@/lib/api';

const AuthContext = createContext();

// ─── Helper: get stored JWT ────────────────────────────────────────────────────
export const getAuthToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('sahulat_token') : null;

// ─── Helper: build auth headers for fetch calls ────────────────────────────────
export const authHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // 'client' | 'worker' | 'admin' | null
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName || firebaseUser.phoneNumber,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    phoneNumber: firebaseUser.phoneNumber,
                });
                const storedRole = localStorage.getItem('sahulat_role');
                setRole(storedRole || 'client');
            } else {
                // Restore backend-authenticated session from localStorage
                const storedToken = localStorage.getItem('sahulat_token');
                const tempUser = localStorage.getItem('sahulat_user_temp');
                const storedRole = localStorage.getItem('sahulat_role');
                if (storedToken && tempUser && storedRole) {
                    setUser(JSON.parse(tempUser));
                    setRole(storedRole);
                } else {
                    setUser(null);
                    setRole(null);
                    localStorage.removeItem('sahulat_role');
                    localStorage.removeItem('sahulat_token');
                    localStorage.removeItem('sahulat_user_temp');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ─── Helper: persist a backend session ────────────────────────────────────
    const _persistSession = (userData, token) => {
        localStorage.setItem('sahulat_token', token);
        localStorage.setItem('sahulat_user_temp', JSON.stringify(userData));
        localStorage.setItem('sahulat_role', userData.role);
        setUser(userData);
        setRole(userData.role);
    };

    // ─── Register (client or worker) ─────────────────────────────────────────
    // POST /api/auth/register
    const register = async ({ name, email, password, role: userRole = 'client', phone, skills, location }) => {
        const data = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                phone,
                password,
                role: userRole,
                skills: skills || [],
                location: location || { lat: 0, lng: 0 },
            }),
        });
        _persistSession(data.data, data.token);
        return data.data;
    };

    // ─── Register Worker (phone or email) ────────────────────────────────────
    const registerWorker = async ({ name, email, phone, password, skills, location }) => {
        return register({ name, email, phone, password, role: 'worker', skills, location });
    };

    // ─── Client Login: email + password ──────────────────────────────────────
    const login = async (email, password) => {
        const data = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        _persistSession(data.data, data.token);
        return data.data;
    };

    // ─── Worker Login: phone + password ──────────────────────────────────────
    const loginWorkerWithPassword = async (phone, password) => {
        const normalizedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0+/, '')}`;
        const data = await apiFetch('/api/auth/worker-login', {
            method: 'POST',
            body: JSON.stringify({ phone: normalizedPhone, password }),
        });
        _persistSession(data.data, data.token);
        return data.data;
    };

    // ─── Social Logins (Mock — pending real Firebase plan) ────────────────────
    const loginWithFacebook = async (selectedRole = 'client') => {
        const dummyUser = { id: 'fb123', name: 'Facebook User', email: 'fb@example.com', role: selectedRole };
        _setMockSession(dummyUser, selectedRole);
        return dummyUser;
    };

    const loginWithGoogle = async (selectedRole = 'client') => {
        const dummyUser = { id: 'gl123', name: 'Google User', email: 'google@example.com', role: selectedRole };
        _setMockSession(dummyUser, selectedRole);
        return dummyUser;
    };

    // ─── OTP stubs (mock — requires paid Firebase SMS plan) ──────────────────
    const initializeRecaptcha = (_containerId) => { };

    const sendVerificationCode = async (_phoneNumber, selectedRole = 'worker') => {
        localStorage.setItem('sahulat_role', selectedRole);
        return { verificationId: 'mock-id-123' };
    };

    const verifyOTP = async (otp) => {
        if (!otp) throw new Error('OTP Required');
        return { uid: 'worker-mock', phoneNumber: '+923001234567' };
    };

    // @deprecated — use registerWorker() instead
    const registerWorkerWithPassword = async (phone, password, selectedRole = 'worker') => {
        const mockWorker = { id: 'worker-' + phone, name: 'New Worker', phoneNumber: phone, role: selectedRole };
        _setMockSession(mockWorker, selectedRole);
        return mockWorker;
    };

    // ─── Internal mock session helper ─────────────────────────────────────────
    const _setMockSession = (userData, selectedRole) => {
        setUser(userData);
        setRole(selectedRole);
        localStorage.setItem('sahulat_user_temp', JSON.stringify(userData));
        localStorage.setItem('sahulat_role', selectedRole);
    };

    // ─── Logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        try { await signOut(auth); } catch (_) { }
        setUser(null);
        setRole(null);
        localStorage.removeItem('sahulat_role');
        localStorage.removeItem('sahulat_token');
        localStorage.removeItem('sahulat_user_temp');
    };

    return (
        <AuthContext.Provider value={{
            user, role, loading, setRole,
            // Registration
            register, registerWorker, registerWorkerWithPassword,
            // Login
            login, loginWorkerWithPassword, loginWithFacebook, loginWithGoogle,
            // OTP (mock)
            initializeRecaptcha, sendVerificationCode, verifyOTP,
            // Logout
            logout,
            // Helpers
            getAuthToken, authHeaders,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
