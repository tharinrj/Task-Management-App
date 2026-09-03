import { Router } from 'express';
import { getUsers, getUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All user routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/users
router.get('/', getUsers);

// GET /api/users/:id
router.get('/:id', getUser);

export default router;
