import { Router } from 'express';
import { getDocuments, getDocumentById, createDocument, deleteDocument } from '../controllers/documentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { enforceDepartmentScope } from '../middleware/rbacMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { uploadDocumentSchema } from '../schemas/validationSchemas.js';

const router = Router();

router.get('/', authenticate, enforceDepartmentScope, getDocuments);
router.get('/:id', authenticate, getDocumentById);
router.post('/', authenticate, validate(uploadDocumentSchema), createDocument);
router.delete('/:id', authenticate, deleteDocument);

export default router;

