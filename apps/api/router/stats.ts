// File: apps/api/router/stats.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const totalSpend = await prisma.invoice.aggregate({
      _sum: {
        invoiceTotal: true,
      },
    });

    const totalInvoices = await prisma.invoice.count();

    // Use the count of documents you just seeded
    const documentsUploaded = await prisma.invoice.count();

    const averageInvoiceValue = await prisma.invoice.aggregate({
      _avg: {
        invoiceTotal: true,
      },
    });

    res.json({
      // Convert Decimal to number for JSON
      totalSpend: totalSpend._sum.invoiceTotal?.toNumber() || 0,
      totalInvoices,
      documentsUploaded,
      // Convert Decimal to number for JSON
      averageInvoiceValue: averageInvoiceValue._avg.invoiceTotal?.toNumber() || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

export default router;