import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const history = await prisma.chatHistory.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json(history);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching chat history' });
    }
});

export default router;