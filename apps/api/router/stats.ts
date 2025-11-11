import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../prisma-client';

const prisma = new PrismaClient();
const router = Router();

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalSpend = await prisma.invoice.aggregate({ _sum: { invoiceTotal: true } });
    const lastMonthSpend = await prisma.invoice.aggregate({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { invoiceTotal: true }
    });
    const currentMonthSpend = await prisma.invoice.aggregate({
      where: { createdAt: { gte: currentMonthStart } },
      _sum: { invoiceTotal: true }
    });
    const totalInvoices = await prisma.invoice.count();
    const lastMonthInvoices = await prisma.invoice.count({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
    });
    const currentMonthInvoices = await prisma.invoice.count({
      where: { createdAt: { gte: currentMonthStart } }
    });
    const documentsUploaded = await prisma.invoice.count();
    const averageInvoiceValue = await prisma.invoice.aggregate({ _avg: { invoiceTotal: true } });
    const lastMonthAverage = await prisma.invoice.aggregate({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      _avg: { invoiceTotal: true }
    });
    const currentMonthAverage = await prisma.invoice.aggregate({
      where: { createdAt: { gte: currentMonthStart } },
      _avg: { invoiceTotal: true }
    });

    const trendDays = 10;
    const totalSpendTrend = [];
    const totalInvoicesTrend = [];
    const averageInvoiceValueTrend = [];

    for (let i = trendDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const daySpend = await prisma.invoice.aggregate({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
        _sum: { invoiceTotal: true }
      });
      const dayCount = await prisma.invoice.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } }
      });
      const dayAvg = await prisma.invoice.aggregate({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
        _avg: { invoiceTotal: true }
      });
      totalSpendTrend.push({ value: daySpend._sum.invoiceTotal?.toNumber() || 0 });
      totalInvoicesTrend.push({ value: dayCount });
      averageInvoiceValueTrend.push({ value: dayAvg._avg.invoiceTotal?.toNumber() || 0 });
    }

    const totalSpendCurrent = currentMonthSpend._sum.invoiceTotal?.toNumber() || 0;
    const totalSpendLast = lastMonthSpend._sum.invoiceTotal?.toNumber() || 0;
    const totalSpendChange = totalSpendLast > 0
        ? (((totalSpendCurrent - totalSpendLast) / totalSpendLast) * 100).toFixed(1)
        : "0.0";
    const totalInvoicesChange = lastMonthInvoices > 0
        ? (((currentMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100).toFixed(1)
        : "0.0";
    const avgCurrent = currentMonthAverage._avg.invoiceTotal?.toNumber() || 0;
    const avgLast = lastMonthAverage._avg.invoiceTotal?.toNumber() || 0;
    const averageInvoiceValueChange = avgLast > 0
        ? (((avgCurrent - avgLast) / avgLast) * 100).toFixed(1)
        : "0.0";

    return res.json({
      totalSpend: totalSpend._sum.invoiceTotal?.toNumber() || 0,
      totalInvoices,
      documentsUploaded,
      averageInvoiceValue: averageInvoiceValue._avg.invoiceTotal?.toNumber() || 0,
      totalSpendTrend,
      totalInvoicesTrend,
      documentsUploadedTrend: totalInvoicesTrend,
      averageInvoiceValueTrend,
      totalSpendChange: `${parseFloat(totalSpendChange) >= 0 ? '+' : ''}${totalSpendChange}%`,
      totalInvoicesChange: `${parseFloat(totalInvoicesChange) >= 0 ? '+' : ''}${totalInvoicesChange}%`,
      documentsUploadedChange: `${parseFloat(totalInvoicesChange) >= 0 ? '+' : ''}${totalInvoicesChange}%`,
      averageInvoiceValueChange: `${parseFloat(averageInvoiceValueChange) >= 0 ? '+' : ''}${averageInvoiceValueChange}%`,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Error fetching stats' });
  }
});

export default router;