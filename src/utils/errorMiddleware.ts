import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from './apiResponse';

// Error handling middleware for route not found
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json(
    new ApiResponse(
      process.env.NODE_ENV === 'production' ? null : { stack: err.stack },
      err.message,
      'failure'
    )
  );
}; 