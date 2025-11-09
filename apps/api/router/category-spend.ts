// File: apps/api/router/category-spend.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/category-spend', async (req, res) => {
  try {
    // 1. Group by the foreign key 'categoryId'
    const categorySpend = await prisma.lineItem.groupBy({
      by: ['categoryId'],
      _sum: {
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
    });

    // 2. Get the actual category info (the 'code', which is the Sachkonto)
    const categoryIds = categorySpend
        .map((c) => c.categoryId)
        .filter((id) => id) as string[]; // Filter out any nulls

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, code: true },
    });

    // 3. Map the codes back to the sums
    const categoryMap = new Map(categories.map((c) => [c.id, c.code]));

    const formattedCategorySpend = categorySpend.map((item) => ({
      category: item.categoryId ? categoryMap.get(item.categoryId) : 'UNKNOWN',
      // 4. Convert the Decimal sum to a number
      spend: item._sum.totalPrice?.toNumber() || 0,
    }));

    res.json(formattedCategorySpend);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ error: 'Error fetching category spend' });
  }
});

export default router;