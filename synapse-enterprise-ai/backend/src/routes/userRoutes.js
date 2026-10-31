import { Router } from 'express';
import { getMe, getAllUsers } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', authenticate, getMe);
router.get('/', authenticate, getAllUsers);

export default router;

