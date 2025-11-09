// File: apps/api/router/invoice-trends.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/invoice-trends', async (req, res) => {
  try {
    const invoiceTrends = await prisma.invoice.groupBy({
      by: ['invoiceDate'],
      _sum: {
        invoiceTotal: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        invoiceDate: 'asc',
      },
    });

    const formattedTrends = invoiceTrends.map((item) => ({
      date: item.invoiceDate,
      // Convert Decimal to number
      totalSpend: item._sum.invoiceTotal?.toNumber() || 0,
      invoiceCount: item._count._all,
    }));

    res.json(formattedTrends);
  } catch (error) {
    console.error('Error fetching invoice trends:', error);
    res.status(500).json({ error: 'Error fetching invoice trends' });
  }
});

export default router;