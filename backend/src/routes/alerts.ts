import { Router } from 'express';
import { mockAlerts } from '../services/mockData.js';

const router = Router();

router.get('/', (_req, res) => {
  const sortedAlerts = [...mockAlerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json(sortedAlerts);
});

router.get('/:id', (req, res) => {
  const alert = mockAlerts.find(a => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  res.json(alert);
});

export default router;
