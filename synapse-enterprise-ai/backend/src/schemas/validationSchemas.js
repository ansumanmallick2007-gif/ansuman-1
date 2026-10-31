import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.enum(['finance', 'hr', 'engineering', 'operations', 'product'], {
    errorMap: () => ({ message: 'Department must be finance, hr, engineering, operations, or product' })
  }),
  role: z.enum(['admin', 'manager', 'employee']).optional().default('employee')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const createWorkflowSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().default(''),
  department: z.enum(['finance', 'hr', 'engineering', 'operations', 'product']),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  dueDate: z.string().optional(),
  assignedTo: z.string().uuid().optional().nullable()
});

export const updateWorkflowSchema = z.object({
  status: z.enum(['backlog', 'in_progress', 'review', 'completed']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  title: z.string().min(3).optional(),
  description: z.string().optional()
});

export const uploadDocumentSchema = z.object({
  title: z.string().min(3, 'Document title must be at least 3 characters'),
  department: z.enum(['finance', 'hr', 'engineering', 'operations', 'product']),
  fileType: z.string().min(1, 'Document type is required'),
  content: z.string().min(10, 'Document content must be at least 10 characters')
});

export const copilotQuerySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  departmentFilter: z.enum(['all', 'finance', 'hr', 'engineering', 'operations', 'product']).optional().default('all')
});

