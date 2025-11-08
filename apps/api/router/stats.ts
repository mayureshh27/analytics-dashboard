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

    // This is a placeholder as the data does not contain this information
    const documentsUploaded = 0; 

    const averageInvoiceValue = await prisma.invoice.aggregate({
      _avg: {
        invoiceTotal: true,
      },
    });

    res.json({
      totalSpend: totalSpend._sum.invoiceTotal,
      totalInvoices,
      documentsUploaded,
      averageInvoiceValue: averageInvoiceValue._avg.invoiceTotal,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

export default router;
