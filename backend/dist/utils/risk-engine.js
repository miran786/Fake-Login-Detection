"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRiskScore = void 0;
const calculateRiskScore = (currentLogin, history) => {
    let score = 0;
    const factors = [];
    const userHistory = history.filter(h => h.email === currentLogin.email);
    // 1. New Device Detection (High impact)
    const knownDevices = new Set(userHistory.map(h => h.device));
    if (userHistory.length > 0 && !knownDevices.has(currentLogin.device)) {
        score += 40;
        factors.push('New device detected');
    }
    // 2. New IP Detection (Medium impact)
    const knownIPs = new Set(userHistory.map(h => h.ip));
    if (userHistory.length > 0 && !knownIPs.has(currentLogin.ip)) {
        score += 20;
        factors.push('New IP address');
    }
    // 3. Time of Day Anomaly (Low impact)
    const hour = new Date(currentLogin.timestamp).getHours();
    if (hour >= 0 && hour < 5) {
        score += 15;
        factors.push('Unusual login time (Late night)');
    }
    // 4. Velocity Check (High impact)
    if (userHistory.length > 0) {
        const lastLogin = userHistory[userHistory.length - 1];
        const timeDiff = new Date(currentLogin.timestamp).getTime() - new Date(lastLogin.timestamp).getTime();
        if (timeDiff < 60000) { // Less than 1 minute
            score += 10;
            factors.push('High frequency login attempt');
        }
    }
    // Base score randomization (simulate other unseen ML factors)
    score += Math.floor(Math.random() * 10);
    score = Math.min(100, Math.max(0, score));
    let level = 'Low';
    if (score >= 70)
        level = 'High';
    else if (score >= 40)
        level = 'Medium';
    return { score, level, factors };
};
exports.calculateRiskScore = calculateRiskScore;
