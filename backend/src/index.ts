import express from 'express';
import cors from 'cors';
import alertsRouter from './routes/alerts.js';
import nodesRouter from './routes/nodes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:4173', 'http://localhost:5173', 'http://localhost:41802'],
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/alerts', alertsRouter);
app.use('/api/nodes', nodesRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET /health`);
  console.log(`   GET /api/alerts`);
  console.log(`   GET /api/alerts/:id`);
  console.log(`   GET /api/nodes`);
  console.log(`   GET /api/nodes/:id`);
});
