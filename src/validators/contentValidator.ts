import Joi from 'joi';

export const createContentSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  type: Joi.string().required().valid('article', 'video', 'podcast', 'image'),
  tags: Joi.array().items(Joi.string()).min(1).required(),
  // We don't include popularity as it starts at 0 by default
}); 