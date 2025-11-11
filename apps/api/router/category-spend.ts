import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

interface Request extends ExpressRequest {}
interface Response extends ExpressResponse {}

const prisma = new PrismaClient();
const router = Router();

router.get('/category-spend', async (req: Request, res: Response) => {
  try {
    const categorySpend = await prisma.lineItem.groupBy({
      by: ['categoryId'],
      _sum: { totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } }
    });
    const categoryIds = categorySpend.map((c: any) => c.categoryId).filter((id: any) => id) as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, code: true }
    });
    const categoryMap = new Map(categories.map((c: any) => [c.id, c.code]));
    const formattedCategorySpend = categorySpend.map((item: any) => ({
      category: item.categoryId ? categoryMap.get(item.categoryId) : 'UNKNOWN',
      spend: item._sum.totalPrice?.toNumber() || 0,
    }));
    res.json(formattedCategorySpend);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ error: 'Error fetching category spend' });
  }
});

export default router;