import { Router } from 'express';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from '../controllers/workflowController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createWorkflowSchema, updateWorkflowSchema } from '../schemas/validationSchemas.js';

const router = Router();

router.get('/', authenticate, getWorkflows);
// Only Managers and Admins can create and assign workflows across departments
router.post('/', authenticate, authorizeRoles('admin', 'manager'), validate(createWorkflowSchema), createWorkflow);
router.patch('/:id', authenticate, validate(updateWorkflowSchema), updateWorkflow);
router.delete('/:id', authenticate, deleteWorkflow);

export default router;

