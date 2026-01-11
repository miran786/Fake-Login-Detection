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

        // Gather risk factors
        const currentFactors: RiskFactors = {
            location: 'New York, USA', // Mocked for now, implies same location usually
            ip: (Math.random() > 0.5 ? '192.168.1.100' : '203.0.113.' + Math.floor(Math.random() * 255)), // Randomize IP slightly
            device: navigator.userAgent,
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

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loginHistory }}>
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
