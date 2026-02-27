const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Centralized fetch wrapper that:
 *  - Points all requests at the backend (localhost:5000 by default)
 *  - Attaches the stored JWT as a Bearer token when present
 *  - Throws on non-OK responses with a clear message
 *
 * @param {string} endpoint  - e.g. '/api/workers/me/stats'
 * @param {RequestInit} options - standard fetch options
 */
export async function apiFetch(endpoint, options = {}) {
    const token =
        typeof window !== 'undefined' ? localStorage.getItem('sahulat_token') : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error ${response.status}`);
    }

    return response.json();
}
