import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateRiskScore, RiskFactors } from '../utils/risk-engine';

type User = {
    name?: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string; riskScore?: number }>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkUserExists: (email: string) => boolean;
    forceLogin: (email: string) => Promise<void>;
    loginHistory: LoginAttempt[];
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

// Helper to parse User Agent
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

// Helper to fetch IP and Location
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
        return {
            ip: '127.0.0.1', // Fallback
            location: 'Unknown Location'
        };
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);

    useEffect(() => {
        // Check for persisted session
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        // Load history
        const history = localStorage.getItem('loginHistory');
        if (history) {
            setLoginHistory(JSON.parse(history));
        }
    }, []);

    const login = async (email: string, password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password);

        // Fetch real data
        const { ip, location } = await fetchIpLocation();
        const device = parseUserAgent(navigator.userAgent);

        // Gather risk factors
        const currentFactors: RiskFactors = {
            location: location,
            ip: ip,
            device: device,
            timestamp: new Date().toISOString(),
            email: email
        };

        // Calculate risk
        // We need to map LoginAttempt back to RiskFactors for history comparison
        const riskHistory: RiskFactors[] = loginHistory.map(h => ({
            location: h.location,
            ip: h.ip,
            device: h.device,
            timestamp: h.timestamp,
            email: h.email
        }));

        const riskResult = calculateRiskScore(currentFactors, riskHistory);
        let status: 'success' | 'blocked' | 'flagged' = 'success';

        if (foundUser) {
            if (riskResult.level === 'high') {
                status = 'blocked';
            } else if (riskResult.level === 'medium') {
                status = 'flagged';
            }
        } else {
            // Even if user not found, we record the attempt? 
            // For simplify, only record successful auth attempts or attempts on existing users.
            // But if user not found, we can't really attach it to a profile easily without a more complex backend.
            // We'll proceed with auth check first.
        }

        // Refined logic: Check credentials FIRST.
        if (foundUser) {
            const newAttempt: LoginAttempt = {
                id: Date.now().toString(),
                ...currentFactors,
                riskScore: riskResult.score,
                status: status === 'blocked' ? 'blocked' : (status === 'flagged' ? 'flagged' : 'success'),
                email: email
            };

            const updatedHistory = [newAttempt, ...loginHistory];
            setLoginHistory(updatedHistory);
            localStorage.setItem('loginHistory', JSON.stringify(updatedHistory));

            if (status === 'blocked') {
                return { success: false, message: 'Login blocked due to high risk activity.', riskScore: riskResult.score };
            }

            const userData = { email: foundUser.email, name: foundUser.name };
            setUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return { success: true, riskScore: riskResult.score };
        } else {
            return { success: false, message: 'Invalid credentials. Please sign up or check your password.' };
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

        if (storedUsers.some((u: any) => u.email === email)) {
            return false; // User exists
        }

        const newUser = { name, email, password };
        storedUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));

        // Auto login
        const userData = { email, name };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    const checkUserExists = (email: string) => {
        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        return storedUsers.some((u: any) => u.email === email);
    };

    const forceLogin = async (email: string) => {
        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const foundUser = storedUsers.find((u: any) => u.email === email);

        if (!foundUser) return;

        // Fetch real data for history
        const { ip, location } = await fetchIpLocation();
        const device = parseUserAgent(navigator.userAgent);

        const newAttempt: LoginAttempt = {
            id: Date.now().toString(),
            location,
            ip,
            device,
            timestamp: new Date().toISOString(),
            riskScore: 0, // Reset usually low risk
            status: 'success',
            email: email
        };

        const updatedHistory = [newAttempt, ...loginHistory];
        setLoginHistory(updatedHistory);
        localStorage.setItem('loginHistory', JSON.stringify(updatedHistory));

        const userData = { email: foundUser.email, name: foundUser.name };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, checkUserExists, forceLogin, loginHistory }}>
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
