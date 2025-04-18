import { Router } from 'express';
import { signup, signin, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signup as any);

/**
 * @route   POST /api/auth/signin
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/signin', signin as any);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate as any, getCurrentUser as any);

export default router; 