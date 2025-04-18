import { Router } from 'express';
import { InteractionController } from '../controllers';
import { validate } from '../utils/validationMiddleware';
import { 
  recordInteractionSchema, 
  userIdParamSchema, 
  interactionTypeQuerySchema 
} from '../utils/validationSchemas';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/interactions
 * @desc    Record a user interaction with content
 * @access  Private
 */
router.post(
  '/',
  authenticate as any,
  validate({ body: recordInteractionSchema }) as any,
  InteractionController.recordInteraction as any
);

/**
 * @route   GET /api/interactions/user/:userId
 * @desc    Get user's interactions
 * @access  Private
 */
router.get(
  '/user/:userId',
  authenticate as any,
  validate({ 
    params: userIdParamSchema,
    query: interactionTypeQuerySchema
  }) as any,
  InteractionController.getUserInteractions as any
);

export default router; 