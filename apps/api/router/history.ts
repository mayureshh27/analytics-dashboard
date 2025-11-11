import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

interface Request extends ExpressRequest {}
interface Response extends ExpressResponse {}

const prisma = new PrismaClient();
const router = Router();

router.get('/history', async (req: Request, res: Response) => {
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