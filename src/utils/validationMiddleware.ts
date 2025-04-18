import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface ValidationOption {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
}

export const validate = (schema: ValidationOption) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { [key: string]: string } = {};

    // Validate request body if schema provided
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          validationErrors[detail.path[0]] = detail.message;
        });
      }
    }

    // Validate request query parameters if schema provided
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          validationErrors[detail.path[0]] = detail.message;
        });
      }
    }

    // Validate request path parameters if schema provided
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          validationErrors[detail.path[0]] = detail.message;
        });
      }
    }

    // If there are validation errors, return a 400 Bad Request response
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        errors: validationErrors
      });
      return;
    }

    next();
  };
}; 