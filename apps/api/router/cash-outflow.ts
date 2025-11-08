import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/cash-outflow', async (req, res) => {
  try {
    const cashOutflow = await prisma.payment.groupBy({
      by: ['dueDate'],
      _sum: {
        discountedTotal: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const formattedCashOutflow = cashOutflow.map(item => ({
        date: item.dueDate,
        amount: item._sum.discountedTotal,
    }));

    res.json(formattedCashOutflow);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cash outflow' });
  }
});

export default router;
