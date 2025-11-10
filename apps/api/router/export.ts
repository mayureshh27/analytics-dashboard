import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();
const router = Router();

router.post('/export/csv', async (req: Request, res: Response) => {
    const { sql } = req.body;

    if (!sql) {
        return res.status(400).json({ error: 'SQL query is required' });
    }

    try {
        const result: any[] = await prisma.$queryRawUnsafe(sql);

        if (result.length === 0) {
            return res.status(404).json({ error: 'No data to export' });
        }

        // BigInts are not supported by JSON.stringify, so we convert them to strings
        const sanitizedResult = result.map(row => {
            const newRow: { [key: string]: any } = {};
            for (const key in row) {
                if (typeof row[key] === 'bigint') {
                    newRow[key] = row[key].toString();
                } else {
                    newRow[key] = row[key];
                }
            }
            return newRow;
        });

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(sanitizedResult);

        res.header('Content-Type', 'text/csv');
        res.attachment('export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        res.status(500).json({ error: 'Error exporting to CSV' });
    }
});

router.post('/export/excel', async (req: Request, res: Response) => {
    const { sql } = req.body;

    if (!sql) {
        return res.status(400).json({ error: 'SQL query is required' });
    }

    try {
        const result: any[] = await prisma.$queryRawUnsafe(sql);

        if (result.length === 0) {
            return res.status(404).json({ error: 'No data to export' });
        }
        
        // BigInts are not supported by JSON.stringify, so we convert them to strings
        const sanitizedResult = result.map(row => {
            const newRow: { [key: string]: any } = {};
            for (const key in row) {
                if (typeof row[key] === 'bigint') {
                    newRow[key] = row[key].toString();
                } else {
                    newRow[key] = row[key];
                }
            }
            return newRow;
        });

        const worksheet = xlsx.utils.json_to_sheet(sanitizedResult);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Results');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('export.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        res.status(500).json({ error: 'Error exporting to Excel' });
    }
});

export default router;
