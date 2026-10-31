import { Router } from 'express';
import { askCopilot } from '../controllers/copilotController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { copilotQuerySchema } from '../schemas/validationSchemas.js';

const router = Router();

router.post('/copilot', authenticate, validate(copilotQuerySchema), askCopilot);

export default router;

