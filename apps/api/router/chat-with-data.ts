import { Router, Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { TextDecoder } from 'util';

const prisma = new PrismaClient();
const router = Router();

router.post('/chat-with-data', async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.body;
    try {
        const response = await fetch(`${process.env.VANNA_API_BASE_URL}/api/v1/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: query }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('Response body was null');

        res.setHeader('Content-Type', 'application/x-ndjson');

        const decoder = new TextDecoder();
        let buffer = "";
        let sqlQuery = "";

        response.body.on('data', (value: any) => {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const parts = buffer.split('\n');
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (part) {
                    try {
                        const parsed = JSON.parse(part);
                        if (parsed.type === 'sql' && !sqlQuery) {
                            sqlQuery = parsed.data;
                            prisma.chatHistory.create({
                                data: { question: query, sql: sqlQuery }
                            }).catch((dbError: any) => {
                                console.error('Error saving to chat history:', dbError);
                            });
                        }
                        res.write(part + '\n');
                    } catch (e) {
                        console.error('Error parsing stream part:', part, e);
                    }
                }
            }
            buffer = parts[parts.length - 1];
        });

        response.body.on('end', () => {
            if (buffer) {
                try {
                    const parsed = JSON.parse(buffer);
                    if (parsed.type === 'sql' && !sqlQuery) {
                        sqlQuery = parsed.data;
                        prisma.chatHistory.create({
                            data: { question: query, sql: sqlQuery }
                        }).catch((dbError: any) => {
                            console.error('Error saving final part to chat history:', dbError);
                        });
                    }
                    res.write(buffer + '\n');
                } catch (e) {
                    console.error('Error parsing final stream part:', buffer, e);
                }
            }
            res.end();
        });

        response.body.on('error', (err: any) => {
            console.error('Error in response body stream:', err);
            return res.status(500).json({ error: 'Error reading from Vanna service' });
        });
    } catch (error) {
        console.error('Error proxying request to Vanna AI service:', (error as Error).message);
        return res.status(500).json({ error: 'Error proxying request to Vanna AI service' });
    }
});

export default router;