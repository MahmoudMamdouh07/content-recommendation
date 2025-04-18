import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Middleware to ensure all responses follow the ApiResponse format
 * Monkey patches res.json to wrap responses in ApiResponse if they aren't already
 */
export const responseFormatter = (req: Request, res: Response, next: NextFunction): void => {
  // Store the original json method
  const originalJson = res.json;

  // Override the json method
  res.json = function(body: any): Response {
    // If it's already an ApiResponse (has status and message fields), don't wrap it
    if (body && typeof body === 'object' && 'status' in body && 'message' in body) {
      return originalJson.call(this, body);
    }
    
    // Otherwise, wrap it in a success response with a generic message
    let controllerName = req.path.split('/').filter(Boolean).pop() || 'API';
    
    // Capitalize the controller name
    controllerName = controllerName.charAt(0).toUpperCase() + controllerName.slice(1);
    
    const responseBody = new ApiResponse(
      body, 
      `${controllerName} operation successful`
    );
    
    return originalJson.call(this, responseBody);
  };
  
  next();
}; 