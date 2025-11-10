import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/cash-outflow', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { dueDate: { not: null } },
      include: { invoice: { select: { invoiceTotal: true } } },
      orderBy: { dueDate: 'asc' }
    });

    const outflowMap = new Map<string, number>();

    for (const payment of payments) {
      if (payment.dueDate && payment.invoice?.invoiceTotal) {
        const dateString = payment.dueDate.toISOString().split('T')[0];
        const currentAmount = outflowMap.get(dateString) || 0;
        outflowMap.set(dateString, currentAmount + payment.invoice.invoiceTotal.toNumber());
      }
    }

    const formattedCashOutflow = Array.from(outflowMap.entries()).map(([date, amount]) => ({
      date: date,
      amount: amount,
    }));

    res.json(formattedCashOutflow);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Error fetching cash outflow' });
  }
});

export default router;
