import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Overview statistics
router.get('/stats', async (req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [totalUsers, totalLogins, totalFailedAttempts, riskGroups, recentSignups] = await Promise.all([
            prisma.user.count(),
            prisma.loginHistory.count(),
            prisma.failedAttempt.count(),
            prisma.loginHistory.groupBy({
                by: ['riskLevel'],
                _count: true,
            }),
            prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        ]);

        const riskDistribution = { low: 0, medium: 0, high: 0 };
        for (const group of riskGroups) {
            const level = group.riskLevel.toLowerCase();
            if (level === 'low') riskDistribution.low = group._count;
            else if (level === 'medium') riskDistribution.medium = group._count;
            else if (level === 'high') riskDistribution.high = group._count;
        }

        res.json({ totalUsers, totalLogins, totalFailedAttempts, riskDistribution, recentSignups });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// All users with summary data
router.get('/users', async (req, res) => {
    try {
        const search = req.query.search as string | undefined;

        const where = search
            ? {
                  OR: [
                      { name: { contains: search, mode: 'insensitive' as const } },
                      { email: { contains: search, mode: 'insensitive' as const } },
                  ],
              }
            : undefined;

        const users = await prisma.user.findMany({
            where,
            include: {
                loginHistory: { orderBy: { timestamp: 'desc' as const }, take: 1 },
                _count: { select: { loginHistory: true, failedAttempts: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(
            users.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                createdAt: u.createdAt.toISOString(),
                lastLogin: u.loginHistory[0]?.timestamp?.toISOString() || null,
                loginCount: u._count.loginHistory,
                failedAttemptCount: u._count.failedAttempts,
                latestRiskScore: u.loginHistory[0]?.riskScore ?? null,
                latestRiskLevel: u.loginHistory[0]?.riskLevel ?? null,
            }))
        );
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Single user full detail
router.get('/users/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                loginHistory: { orderBy: { timestamp: 'desc' } },
                failedAttempts: { orderBy: { timestamp: 'desc' } },
            },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            lastLogin: user.lastLogin?.toISOString() || null,
            loginHistory: user.loginHistory.map((h: any) => ({
                id: h.id,
                timestamp: h.timestamp.toISOString(),
                ip: h.ip,
                city: h.city,
                country: h.country,
                device: h.device,
                riskScore: h.riskScore,
                riskLevel: h.riskLevel,
            })),
            failedAttempts: user.failedAttempts.map((f: any) => ({
                id: f.id,
                timestamp: f.timestamp.toISOString(),
                ip: f.ip,
                browser: f.browser,
            })),
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
