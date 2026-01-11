export interface RiskFactors {
    location: string;
    ip: string;
    device: string;
    timestamp: string;
    email: string;
}

export interface RiskResult {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
}

export const calculateRiskScore = (
    currentLogin: RiskFactors,
    history: RiskFactors[]
): RiskResult => {
    let score = 0;
    const factors: string[] = [];
    const userHistory = history.filter(h => h.email === currentLogin.email);

    // 1. New Device Detection (High impact)
    const knownDevices = new Set(userHistory.map(h => h.device));
    if (userHistory.length > 0 && !knownDevices.has(currentLogin.device)) {
        score += 40;
        factors.push('New device detected');
    }

    // 2. New Location/IP Detection (Medium impact)
    // Simple check: have we seen this IP before?
    const knownIPs = new Set(userHistory.map(h => h.ip));
    if (userHistory.length > 0 && !knownIPs.has(currentLogin.ip)) {
        score += 20;
        factors.push('New IP address');
    }

    // 3. Time of Day Anomaly (Low impact)
    // Assume "normal" hours are 6am - 12am. 
    const hour = new Date(currentLogin.timestamp).getHours();
    if (hour >= 0 && hour < 5) {
        score += 15;
        factors.push('Unusual login time (Late night)');
    }

    // 4. Velocity Check (High impact)
    // If multiple logins in short duration (e.g. < 5 mins) from different locations (simulated)
    // For this demo, we just check if last login was very recent (< 1 min)
    if (userHistory.length > 0) {
        const lastLogin = userHistory[userHistory.length - 1];
        const timeDiff = new Date(currentLogin.timestamp).getTime() - new Date(lastLogin.timestamp).getTime();
        if (timeDiff < 60000) { // Less than 1 minute
            score += 10;
            factors.push('High frequency login attempt');
        }
    }

    // Base score randomization (simulate other unseen ML factors)
    // Add 0-10 random points
    score += Math.floor(Math.random() * 10);

    // Normalize
    score = Math.min(100, Math.max(0, score));

    let level: 'low' | 'medium' | 'high' = 'low';
    if (score >= 70) level = 'high';
    else if (score >= 40) level = 'medium';

    return { score, level, factors };
};
