import { Router } from 'express';
import fetch from 'node-fetch'; // This is node-fetch@2
import { PrismaClient } from '@prisma/client';
import { TextDecoder } from 'util'; // Import Node.js TextDecoder

const prisma = new PrismaClient();
const router = Router();

router.post('/chat-with-data', async (req, res) => {
    const { query } = req.body;

    try {
        const response = await fetch(`${process.env.VANNA_API_BASE_URL}/api/v1/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('Response body was null');
        }

        res.setHeader('Content-Type', 'application/x-ndjson');

        // --- THIS IS THE FIX ---
        // Use Node.js event-based stream handling

        const decoder = new TextDecoder();
        let buffer = "";
        let sqlQuery = "";

        response.body.on('data', (value) => {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const parts = buffer.split('\n');
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (part) {
                    try {
                        const parsed = JSON.parse(part);
                        if (parsed.type === 'sql' && !sqlQuery) { // Only save the first SQL query
                            sqlQuery = parsed.data;

                            // Save to database, but don't block the stream.
                            // Run it in the background and log any errors.
                            prisma.chatHistory.create({
                                data: {
                                    question: query,
                                    sql: sqlQuery,
                                },
                            }).catch(dbError => {
                                console.error('Error saving to chat history:', dbError);
                            });
                        }
                        res.write(part + '\n'); // Stream this part to the client
                    } catch (e) {
                        console.error('Error parsing stream part:', part, e);
                    }
                }
            }
            buffer = parts[parts.length - 1]; // Keep the last incomplete part
        });

        response.body.on('end', () => {
            // Handle any remaining data in the buffer
            if (buffer) {
                try {
                    const parsed = JSON.parse(buffer);
                    if (parsed.type === 'sql' && !sqlQuery) {
                        sqlQuery = parsed.data;
                        prisma.chatHistory.create({
                            data: {
                                question: query,
                                sql: sqlQuery,
                            },
                        }).catch(dbError => {
                            console.error('Error saving final part to chat history:', dbError);
                        });
                    }
                    res.write(buffer + '\n');
                } catch (e) {
                    console.error('Error parsing final stream part:', buffer, e);
                }
            }
            res.end(); // End the response to the client
        });

        response.body.on('error', (err) => {
            console.error('Error in response body stream:', err);
            res.status(500).json({ error: 'Error reading from Vanna service' });
        });

    } catch (error) {
        console.error('Error proxying request to Vanna AI service:', (error as Error).message);
        res.status(500).json({ error: 'Error proxying request to Vanna AI service' });
    }
});

export default router;