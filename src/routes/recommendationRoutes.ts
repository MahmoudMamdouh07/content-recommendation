import { Router } from 'express';
import { RecommendationController } from '../controllers';
import { validate } from '../utils/validationMiddleware';
import { 
  filterContentSchema, 
  userIdParamSchema, 
  recommendationQuerySchema 
} from '../utils/validationSchemas';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();


/**
 * @route   GET /api/recommendations/:userId
 * @desc    Get personalized content recommendations for a user
 * @access  Private
 */
router.get(
  '/user/:userId',
  authenticate as any,
  validate({
    params: userIdParamSchema,
    query: recommendationQuerySchema
  }) as any,
  RecommendationController.getRecommendations as any
);

export default router; 