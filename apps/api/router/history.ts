import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/history', async (req: express.Request, res: express.Response) => {
    try {
        const history = await prisma.chatHistory.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching chat history' });
    }
});

export default router;