import { Router } from 'express';
import { mockNodes } from '../services/mockData.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(mockNodes);
});

router.get('/:id', (req, res) => {
  const node = mockNodes.find(n => n.id === req.params.id);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }
  res.json(node);
});

export default router;
