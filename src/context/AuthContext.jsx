import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const API = '/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('liq_token'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('liq_refresh'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const clearAuth = useCallback(() => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem('liq_token');
        localStorage.removeItem('liq_refresh');
    }, []);

    const authFetch = useCallback(async (url, options = {}) => {
        const currentToken = localStorage.getItem('liq_token');
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
                ...options.headers,
            },
        });

        if (res.status === 401) {
            const currentRefresh = localStorage.getItem('liq_refresh');
            if (currentRefresh) {
                try {
                    const refreshRes = await fetch(`${API}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: currentRefresh }),
                    });
                    if (refreshRes.ok) {
                        const data = await refreshRes.json();
                        localStorage.setItem('liq_token', data.accessToken);
                        localStorage.setItem('liq_refresh', data.refreshToken);
                        setToken(data.accessToken);
                        setRefreshToken(data.refreshToken);
                        return fetch(url, {
                            ...options,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${data.accessToken}`,
                                ...options.headers,
                            },
                        });
                    }
                } catch (_) { }
            }
            clearAuth();
        }
        return res;
    }, [clearAuth]);

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        authFetch(`${API}/auth/me`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => { setUser(data); setLoading(false); })
            .catch(() => { clearAuth(); setLoading(false); });
    }, [token, authFetch, clearAuth]);

    const login = async (email, password) => {
        setError(null);
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error || 'Login failed');
            return { ok: false, error: data.error, code: data.code, minutesLeft: data.minutesLeft };
        }
        localStorage.setItem('liq_token', data.accessToken);
        localStorage.setItem('liq_refresh', data.refreshToken);
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.user);
        return { ok: true };
    };

    const register = async (displayName, email, password, department, title, reasonForAccess, referralCode) => {
        setError(null);
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, email, password, department, title, reasonForAccess, referralCode }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error || 'Registration failed');
            return { ok: false, error: data.error, details: data.details };
        }
        return { ok: true, message: data.message };
    };

    const logout = async () => {
        try { await authFetch(`${API}/auth/logout`, { method: 'POST' }); } catch (_) { }
        clearAuth();
    };

    return (
        <AuthContext.Provider value={{
            user, token, loading, error, setError,
            login, register, logout, authFetch, clearAuth,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'super_admin' || user?.role === 'admin',
            isSuperAdmin: user?.role === 'super_admin',
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
