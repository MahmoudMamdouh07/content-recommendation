import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import User, { IUser } from '../models/User';
import { ApiResponse } from '../utils/apiResponse';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Middleware to authenticate user using JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(
        new ApiResponse(null, 'No token provided, authorization denied', 'failure')
      );
      return;
    }
    
    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Find user by id
    const user = await User.findOne({ id: decoded.id });
    
    if (!user) {
      res.status(401).json(
        new ApiResponse(null, 'User not found', 'failure')
      );
      return;
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json(
      new ApiResponse(null, 'Token is not valid', 'failure')
    );
    return;
  }
};

/**
 * Middleware to authorize admin users
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json(
      new ApiResponse(null, 'Access denied: Admin privileges required', 'failure')
    );
  }
};

export const checkAdminForContentAddition = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json(
      new ApiResponse(null, 'Forbidden: Only admins can add new content', 'failure')
    );
  }
}; 