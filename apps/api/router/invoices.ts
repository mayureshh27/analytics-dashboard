import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/invoices', async (req, res) => {
  const { search, sortBy, sortOrder } = req.query;

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: search ? [
          { invoiceId: { contains: search as string, mode: 'insensitive' } },
          { vendor: { name: { contains: search as string, mode: 'insensitive' } } },
        ] : undefined,
      },
      include: {
        vendor: true,
      },
      orderBy: sortBy ? {
        [sortBy as string]: sortOrder || 'asc',
      } : undefined,
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoices' });
  }
});

export default router;
