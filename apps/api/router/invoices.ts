import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/invoices', async (req: Request, res: Response) => {
    const { search, sortBy, sortOrder } = req.query;

    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                OR: search ? [
                    { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
                    { vendor: { name: { contains: search as string, mode: 'insensitive' } } }
                ] : undefined,
            },
            include: { vendor: true, customer: true, payment: true },
            orderBy: sortBy ? { [sortBy as string]: sortOrder || 'asc' } : { invoiceDate: 'desc' }
        });

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Error fetching invoices' });
    }
});

export default router;
