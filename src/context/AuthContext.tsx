import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendSuspiciousLoginAlert } from '../utils/email-service';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

type User = {
    name?: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string; riskScore?: number; alertSent?: boolean }>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkUserExists: (email: string) => Promise<boolean>;
    forceLogin: (email: string) => Promise<void>;
    loginHistory: LoginAttempt[];
    fetchHistory: (email: string) => Promise<void>;
};

export interface LoginAttempt {
    id: string;
    timestamp: string;
    location: string;
    ip: string;
    device: string;
    riskScore: number;
    status: 'success' | 'blocked' | 'flagged';
    email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseUserAgent = (ua: string) => {
    let browser = "Unknown Browser";
    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
    else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";

    let os = "Unknown OS";
    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "MacOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("like Mac") > -1) os = "iOS";

    return `${browser} on ${os}`;
};

const fetchIpLocation = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch IP data');
        const data = await response.json();
        return {
            ip: data.ip || 'Unknown IP',
            location: `${data.city}, ${data.country_name}` || 'Unknown Location'
        };
    } catch (error) {
        console.error("Error fetching IP location:", error);
        return { ip: '127.0.0.1', location: 'Unknown Location' };
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            fetchHistory(parsed.email);
        }
    }, []);

    const fetchHistory = async (email: string) => {
        try {
            const res = await fetch(`${API_BASE}/user/history?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setLoginHistory(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const login = async (email: string, password: string) => {
        const { ip, location } = await fetchIpLocation();
        const device = parseUserAgent(navigator.userAgent);

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, ip, location, device })
            });

            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                await fetchHistory(email);
                return { success: true, riskScore: data.riskScore };
            } else {
                if (data.alertSent) {
                    await sendSuspiciousLoginAlert(email, {
                        ip,
                        device,
                        location,
                        timestamp: new Date().toISOString()
                    });
                }
                return { success: false, message: data.message, riskScore: data.riskScore, alertSent: data.alertSent };
            }
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Server error' };
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setLoginHistory([]);
        localStorage.removeItem('currentUser');
    };

    const checkUserExists = async (email: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/auth/check-user?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            return !!data.exists;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const forceLogin = async (email: string) => {
        const { ip, location } = await fetchIpLocation();
        const device = parseUserAgent(navigator.userAgent);

        try {
            const res = await fetch(`${API_BASE}/auth/force-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, ip, location, device })
            });

            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                await fetchHistory(email);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, checkUserExists, forceLogin, loginHistory, fetchHistory }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
