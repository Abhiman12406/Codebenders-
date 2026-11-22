import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import invoicesRouter from './routes/invoices.js';
import portalRouter from './routes/portal.js';
import forecastRouter from './routes/forecast.js';
import triageRouter from './routes/triage.js';
import outflowsRouter from './routes/outflows.js';
import profileRouter from './routes/profile.js';
import aiRouter from './routes/ai.js';

const app = express();

const clientUrl = process.env.CLIENT_URL;
if (clientUrl) {
  app.use(cors({
    origin: [clientUrl, 'http://localhost:5173', /\.vercel\.app$/],
    credentials: true,
  }));
} else {
  app.use(cors());
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json());

app.use('/api/invoices', invoicesRouter);
app.use('/api/portal', portalRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/triage', triageRouter);
app.use('/api/outflows', outflowsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/ai', aiRouter);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: { message: 'Not found', status: 404 } }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: { message: err.message || 'Internal server error', status } });
});

export default app;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => console.log(`StudioFlow API listening on port ${port}`));
}
