import { Router } from 'express';
import { getSummary, getAuditLogs, createExecutiveBriefing, getSystemHealth } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/summary', authenticate, getSummary);
router.get('/audit-logs', authenticate, getAuditLogs);
router.post('/reports/generate', authenticate, createExecutiveBriefing);
router.get('/health', getSystemHealth);

export default router;

