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

    // The data is not monthly, so we are returning the daily data.
    // The frontend will need to aggregate this data monthly.
    const formattedTrends = invoiceTrends.map(item => ({
        date: item.invoiceDate,
        totalSpend: item._sum.invoiceTotal,
        invoiceCount: item._count._all,
    }));

    res.json(formattedTrends);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoice trends' });
  }
});

export default router;
