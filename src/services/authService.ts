import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

// Environment variables should be properly set in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

interface TokenPayload {
  id: string;
  username: string;
  role: string;
}

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = { 
    id: user.id, 
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 