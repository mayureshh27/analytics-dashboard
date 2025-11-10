// File: apps/api/router/cash-outflow.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/cash-outflow', async (req: Request, res: Response) => {
  try {
    // 1. Get all payments that have a due date
    const payments = await prisma.payment.findMany({
      where: {
        dueDate: { not: null },
      },
      // 2. Include the related invoice to get its total
      include: {
        invoice: {
          select: { invoiceTotal: true },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // 3. Group the results by date in JavaScript
    const outflowMap = new Map<string, number>();

    for (const payment of payments) {
      // Ensure we have a date and an invoice total
      if (payment.dueDate && payment.invoice?.invoiceTotal) {
        const dateString = payment.dueDate.toISOString().split('T')[0];
        const currentAmount = outflowMap.get(dateString) || 0;

        // 4. Add the invoice total (as a number) to the map
        outflowMap.set(
            dateString,
            currentAmount + payment.invoice.invoiceTotal.toNumber(),
        );
      }
    }

    // 5. Convert the map to the array format the frontend expects
    const formattedCashOutflow = Array.from(outflowMap.entries()).map(
        ([date, amount]) => ({
          date: date,
          amount: amount,
        }),
    );

    res.json(formattedCashOutflow);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Error fetching cash outflow' });
  }
});

export default router;