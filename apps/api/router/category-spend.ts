import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/category-spend', async (req, res) => {
  try {
    const categorySpend = await prisma.lineItem.groupBy({
      by: ['sachkonto'],
      _sum: {
        totalPrice: true,
      },
    });

    const formattedCategorySpend = categorySpend.map(item => ({
        category: item.sachkonto,
        spend: item._sum.totalPrice,
    }));

    res.json(formattedCategorySpend);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching category spend' });
  }
});

export default router;
