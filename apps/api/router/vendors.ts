// File: apps/api/router/vendors.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/vendors/top10', async (req: Request, res: Response) => {
    try {
        // 1. Group invoices by vendorId and sum their totals in the DB (efficient).
        const vendorSpend = await prisma.invoice.groupBy({
            by: ['vendorId'],
            _sum: {
                invoiceTotal: true,
            },
            orderBy: {
                _sum: {
                    invoiceTotal: 'desc',
                },
            },
            take: 10,
        });

        // 2. Get the names for the top 10 vendor IDs.
        const vendorIds = vendorSpend.map((v) => v.vendorId);
        const vendors = await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, name: true },
        });

        // 3. Map the names back to the sums.
        const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

        const formattedVendors = vendorSpend.map((item) => ({
            name: vendorMap.get(item.vendorId) || 'Unknown Vendor',
            // 4. Convert the Decimal sum to a number for the frontend.
            totalSpend: item._sum.invoiceTotal?.toNumber() || 0,
        }));

        res.json(formattedVendors);
    } catch (error) {
        console.error('Error fetching top 10 vendors:', error);
        res.status(500).json({ error: 'Error fetching top 10 vendors' });
    }
});

export default router;