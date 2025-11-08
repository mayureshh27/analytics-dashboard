import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/vendors/top10', async (req, res) => {
  try {
    const topVendors = await prisma.vendor.findMany({
      take: 10,
      include: {
        invoices: {
          select: {
            invoiceTotal: true,
          },
        },
      },
    });

    const formattedVendors = topVendors.map(vendor => {
        const totalSpend = vendor.invoices.reduce((acc, invoice) => acc + (invoice.invoiceTotal || 0), 0);
        return {
            name: vendor.name,
            totalSpend,
        }
    }).sort((a, b) => b.totalSpend - a.totalSpend);

    res.json(formattedVendors);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching top 10 vendors' });
  }
});

export default router;
