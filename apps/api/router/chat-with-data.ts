import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.post('/chat-with-data', async (req, res) => {
    const { query } = req.body;

    try {
        const response = await axios.post(`${process.env.VANNA_API_BASE_URL}/api/v1/chat`, { question: query });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error proxying request to Vanna AI service' });
    }
});

export default router;