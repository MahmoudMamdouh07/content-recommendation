import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../services/authService';
import { signupSchema, signinSchema } from '../utils/validationSchemas';
import { ApiResponse } from '../utils/apiResponse';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json(
        new ApiResponse(null, error.details[0].message, 'failure')
      );
    }

    const { username, password, preferences } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json(
        new ApiResponse(null, 'User already exists', 'failure')
      );
    }

    // Create new user
    const user = await User.create({
      username,
      password,
      preferences: preferences || []
    });

    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      preferences: user.preferences
    };

    return res.status(201).json(
      new ApiResponse(userData, 'User created successfully')
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json(
      new ApiResponse({ error: errorMessage }, 'Server error during user registration', 'failure')
    );
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/signin
 * @access  Public
 */
export const signin = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json(
        new ApiResponse(null, error.details[0].message, 'failure')
      );
    }

    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json(
        new ApiResponse(null, 'Invalid credentials', 'failure')
      );
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(
        new ApiResponse(null, 'Invalid credentials', 'failure')
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      preferences: user.preferences,
      token: `Bearer ${token}`
    };

    return res.json(
      new ApiResponse(userData, 'User authenticated successfully')
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json(
      new ApiResponse({ error: errorMessage }, 'Server error during authentication', 'failure')
    );
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ id: req.user?.id });
    
    if (!user) {
      return res.status(404).json(
        new ApiResponse(null, 'User not found', 'failure')
      );
    }

    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      preferences: user.preferences
    };

    return res.json(
      new ApiResponse(userData, 'User profile retrieved successfully')
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json(
      new ApiResponse({ error: errorMessage }, 'Server error retrieving user profile', 'failure')
    );
  }
}; 