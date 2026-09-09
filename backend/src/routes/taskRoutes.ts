import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  reorderTasks,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks
router.get('/', getTasks);

// POST /api/tasks
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['todo', 'doing', 'done'])
      .withMessage('Status must be "todo", "doing", or "done"'),
  ],
  createTask
);

// PATCH /api/tasks/reorder — batch reorder tasks (must be before :id routes)
router.patch('/reorder', reorderTasks);

// GET /api/tasks/:id
router.get('/:id', getTask);

// PUT /api/tasks/:id
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['todo', 'doing', 'done'])
      .withMessage('Status must be "todo", "doing", or "done"'),
  ],
  updateTask
);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

// PATCH /api/tasks/:id/status — for drag-and-drop
router.patch('/:id/status', updateTaskStatus);

// PATCH /api/tasks/:id/assign — assign/reassign task
router.patch('/:id/assign', assignTask);

export default router;
