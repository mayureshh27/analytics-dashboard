import express, { Application } from 'express';
import cors from 'cors';
import statsRouter from './router/stats';
import invoiceTrendsRouter from './router/invoice-trends';
import vendorsRouter from './router/vendors';
import categorySpendRouter from './router/category-spend';
import cashOutflowRouter from './router/cash-outflow';
import invoicesRouter from './router/invoices';
import exportRouter from './router/export';
import historyRouter from './router/history';
import chatWithDataRouter from './router/chat-with-data';

const app: Application = express();
const port = process.env.PORT || 4000;

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', statsRouter);
app.use('/api', invoiceTrendsRouter);
app.use('/api', vendorsRouter);
app.use('/api', categorySpendRouter);
app.use('/api', cashOutflowRouter);
app.use('/api', invoicesRouter);
app.use('/api', chatWithDataRouter);
app.use('/api', historyRouter);
app.use('/api', exportRouter);

export default app;