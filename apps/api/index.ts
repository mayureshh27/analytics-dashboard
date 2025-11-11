import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import statsRouter from './router/stats';
import invoiceTrendsRouter from './router/invoice-trends';
import vendorsRouter from './router/vendors';
import categorySpendRouter from './router/category-spend';
import cashOutflowRouter from './router/cash-outflow';
import invoicesRouter from './router/invoices';
import exportRouter from './router/export';
import historyRouter from './router/history';
import chatWithDataRouter from './router/chat-with-data';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', statsRouter);
app.use('/api', invoiceTrendsRouter);
app.use('/api', vendorsRouter);
app.use('/api', categorySpendRouter);
app.use('/api', cashOutflowRouter);
app.use('/api', invoicesRouter);
app.use('/api', chatWithDataRouter);
app.use('/api', historyRouter);
app.use('/api', exportRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    console.log(`[server]: Health check available at http://localhost:${port}/health`);
  });
}

export default app;