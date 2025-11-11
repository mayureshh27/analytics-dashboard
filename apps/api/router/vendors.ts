import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

interface Request extends ExpressRequest {}
interface Response extends ExpressResponse {}

const prisma = new PrismaClient();
const router = Router();

router.get('/vendors/top10', async (req: Request, res: Response) => {
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
        res.json(formattedVendors);
    } catch (error) {
        console.error('Error fetching top 10 vendors:', error);
        res.status(500).json({ error: 'Error fetching top 10 vendors' });
    }
});

export default router;