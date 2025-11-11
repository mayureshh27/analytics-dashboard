import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../prisma-client';

const prisma = new PrismaClient();
const router = Router();

router.get('/vendors/top10', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorSpend = await prisma.invoice.groupBy({
            by: ['vendorId'],
            _sum: { invoiceTotal: true },
            orderBy: { _sum: { invoiceTotal: 'desc' } },
            take: 10,
        });
        const vendorIds = vendorSpend.map((v: any) => v.vendorId);
        const vendors = await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, name: true },
        });
        const vendorMap = new Map(vendors.map((v: any) => [v.id, v.name]));
        const formattedVendors = vendorSpend.map((item: any) => ({
            name: vendorMap.get(item.vendorId) || 'Unknown Vendor',
            totalSpend: item._sum.invoiceTotal?.toNumber() || 0,
        }));
        return res.json(formattedVendors);
    } catch (error) {
        console.error('Error fetching top 10 vendors:', error);
        return res.status(500).json({ error: 'Error fetching top 10 vendors' });
    }
});

export default router;