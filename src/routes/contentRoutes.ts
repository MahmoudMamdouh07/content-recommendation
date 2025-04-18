import { Router } from 'express';
import { ContentController } from '../controllers';
import { validate } from '../utils/validationMiddleware';
import { authenticate, checkAdminForContentAddition } from '../middleware/authMiddleware';
import { contentIdParamSchema, createContentSchema, updateContentSchema, contentQuerySchema, contentSearchSchema } from '../utils/validationSchemas';

const router = Router();

/**
 * @route   POST /api/content
 * @desc    Create new content
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate as any,
  checkAdminForContentAddition as any,
  validate({ body: createContentSchema }) as any,
  ContentController.createContent as any
);

/**
 * @route   GET /api/content
 * @desc    Get all content with pagination and filtering
 * @access  Public
 */
router.get(
  '/',
  validate({ query: contentQuerySchema }) as any,
  ContentController.getAllContent as any
);

/**
 * @route   GET /api/content/filter
 * @desc    Filter content by type
 * @access  Public
 */
router.get(
  '/filter',
  validate({ query: contentSearchSchema }) as any,
  ContentController.searchContent as any
);


export default router; 