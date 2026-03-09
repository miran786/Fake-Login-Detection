"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const risk_engine_1 = require("../utils/risk-engine");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/login', async (req, res) => {
    try {
        const { email, password, ip, location, device } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        // History required for risk score
        const historyEntries = await prisma.loginHistory.findMany({
            where: { user: { email } },
            take: 20,
            orderBy: { timestamp: 'desc' }
        });
        const history = historyEntries.map((h) => ({
            location: `${h.city}, ${h.country}`,
            ip: h.ip || '',
            device: h.device || '',
            timestamp: h.timestamp.toISOString(),
            email: email
        }));
        const currentFactors = {
            location: location || 'Unknown',
            ip: ip || 'Unknown',
            device: device || 'Unknown',
            timestamp: new Date().toISOString(),
            email
        };
        const riskResult = (0, risk_engine_1.calculateRiskScore)(currentFactors, history);
        let status = 'success';
        if (riskResult.level === 'High')
            status = 'blocked';
        else if (riskResult.level === 'Medium')
            status = 'flagged';
        if (user && user.password === password) {
            // Success
            const city = location?.split(',')[0]?.trim() || '';
            const country = location?.split(',')[1]?.trim() || '';
            await prisma.loginHistory.create({
                data: {
                    userId: user.id,
                    ip,
                    city,
                    country,
                    device,
                    riskScore: riskResult.score,
                    riskLevel: riskResult.level,
                    timestamp: new Date()
                }
            });
            if (status === 'blocked') {
                return res.json({ success: false, message: 'Login blocked due to high risk activity.', riskScore: riskResult.score });
            }
            // Reset failed attempts
            await prisma.failedAttempt.deleteMany({ where: { userId: user.id } });
            return res.json({ success: true, riskScore: riskResult.score, user: { name: user.name, email: user.email } });
        }
        else {
            // Failed login
            let alertSent = false;
            if (user) {
                await prisma.failedAttempt.create({
                    data: {
                        userId: user.id,
                        ip
                    }
                });
                const startOfWindow = new Date(Date.now() - 1000 * 60 * 60 * 24); // 24 hours
                const failedCount = await prisma.failedAttempt.count({
                    where: { userId: user.id, timestamp: { gte: startOfWindow } }
                });
                if (failedCount >= 3) {
                    alertSent = true;
                    await prisma.failedAttempt.deleteMany({ where: { userId: user.id } }); // reset
                }
            }
            return res.json({
                success: false,
                message: 'Invalid credentials. Please sign up or check your password.',
                alertSent
            });
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        const user = await prisma.user.create({
            data: { name, email, password }
        });
        res.json({ success: true, user: { name: user.name, email: user.email } });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/force-login', async (req, res) => {
    try {
        const { email, ip, location, device } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const city = location?.split(',')[0]?.trim() || '';
        const country = location?.split(',')[1]?.trim() || '';
        await prisma.loginHistory.create({
            data: {
                userId: user.id,
                ip,
                city,
                country,
                device,
                riskScore: 0,
                riskLevel: 'Low',
                timestamp: new Date()
            }
        });
        res.json({ success: true, user: { name: user.name, email: user.email } });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/check-user', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email)
            return res.status(400).json({ error: 'Email required' });
        const user = await prisma.user.findUnique({ where: { email } });
        res.json({ exists: !!user });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
