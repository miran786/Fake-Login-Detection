"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/history', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email)
            return res.status(400).json({ error: 'Email required' });
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const history = await prisma.loginHistory.findMany({
            where: { userId: user.id },
            orderBy: { timestamp: 'desc' }
        });
        res.json(history.map((h) => ({
            id: h.id,
            timestamp: h.timestamp.toISOString(),
            location: `${h.city}, ${h.country}`,
            ip: h.ip,
            device: h.device,
            riskScore: h.riskScore,
            status: h.riskLevel.toLowerCase() === 'high' ? 'blocked' : (h.riskLevel.toLowerCase() === 'medium' ? 'flagged' : 'success'),
            email: email
        })));
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/failed-attempts', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email)
            return res.status(400).json({ error: 'Email required' });
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const failed = await prisma.failedAttempt.findMany({
            where: { userId: user.id },
            orderBy: { timestamp: 'desc' },
            take: 3
        });
        res.json(failed);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
