import Joi from 'joi';

// User validation schemas
export const signupSchema = Joi.object({
  username: Joi.string().required().min(3),
  password: Joi.string().required().min(6),
  preferences: Joi.array().items(Joi.string())
});

export const signinSchema = Joi.object({
  username: Joi.string().required().min(3),
  password: Joi.string().required()
});

// Interaction validation schemas
export const recordInteractionSchema = Joi.object({
  contentId: Joi.string().required(),
  type: Joi.string().valid('view', 'like', 'share', 'comment', 'save').required(),
  duration: Joi.number().when('type', {
    is: 'view',
    then: Joi.number().required(),
    otherwise: Joi.optional()
  }),
  comment: Joi.string().when('type', {
    is: 'comment',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  })
});

// Query validation schemas for user interactions
export const getUserInteractionsSchema = Joi.object({
  type: Joi.string().valid('view', 'like', 'share', 'comment', 'save').optional()
});

// Parameter validation schemas
export const userIdParamSchema = Joi.object({
  userId: Joi.string().required()
});

// Query validation schemas
export const interactionTypeQuerySchema = Joi.object({
  type: Joi.string().valid('view', 'like', 'share', 'comment', 'save')
});

export const filterContentSchema = Joi.object({
  category: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  popularity: Joi.string().valid('high', 'medium', 'low'),
  limit: Joi.number().default(10)
});

export const recommendationQuerySchema = Joi.object({
  limit: Joi.number().default(10),
  includeWatched: Joi.boolean().default(false)
});

// Recommendation validation schemas
export const getRecommendationsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  type: Joi.string().optional(),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional()
});

// Content validation schemas
export const contentIdParamSchema = Joi.object({
  id: Joi.string().required()
});

export const createContentSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  type: Joi.string().required().valid('article', 'video', 'podcast', 'image'),
  tags: Joi.array().items(Joi.string()).min(1).required()
});

export const updateContentSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  type: Joi.string().valid('article', 'video', 'podcast', 'image').optional(),
  tags: Joi.array().items(Joi.string()).min(1).optional()
}).min(1); // Require at least one field to be updated

export const contentQuerySchema = Joi.object({
  type: Joi.string().valid('article', 'video', 'podcast', 'image').optional(),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10).optional(),
  sortField: Joi.string().valid('title', 'createdAt', 'popularity').default('createdAt').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional()
});

export const contentSearchSchema = Joi.object({
  type: Joi.string().valid('article', 'video', 'podcast', 'image').required(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10).optional()
}); 