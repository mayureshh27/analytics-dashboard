// File: apps/api/router/invoices.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/invoices', async (req, res) => {
  const { search, sortBy, sortOrder } = req.query;

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: search
            ? [
              // FIXED: Search 'invoiceNumber' not 'invoiceId'
              {
                invoiceNumber: {
                  contains: search as string,
                  mode: 'insensitive',
                },
              },
              {
                vendor: {
                  name: { contains: search as string, mode: 'insensitive' },
                },
              },
            ]
            : undefined,
      },
      include: {
        vendor: true,
        customer: true,
        payment: true,
      },
      orderBy: sortBy
          ? {
            [sortBy as string]: sortOrder || 'asc',
          }
          : { invoiceDate: 'desc' }, // Default sort
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Error fetching invoices' });
  }
});

export default router;