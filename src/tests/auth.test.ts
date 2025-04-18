import { Request, Response } from 'express';
import { signup, signin, getCurrentUser } from '../controllers/authController';
import User from '../models/User';
import { generateToken, verifyToken } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';

// Mock dependencies
jest.mock('../models/User');
jest.mock('../services/authService');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock response with status and json methods
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation(result => {
        responseObject = result;
        return mockResponse;
      })
    };
  });

  describe('signup', () => {
    it('should create a new user and return 201 status', async () => {
      // Mock request data
      mockRequest = {
        body: {
          username: 'testuser',
          password: 'password123',
          preferences: ['tech', 'science']
        }
      };

      // Mock User.findOne to simulate no existing user
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Mock User.create to return a new user
      (User.create as jest.Mock).mockResolvedValue({
        id: 'test-user-id',
        username: 'testuser',
        role: 'user',
        preferences: ['tech', 'science']
      });

      // Call the controller
      await signup(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        preferences: ['tech', 'science']
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('success');
      expect(responseObject.body).toHaveProperty('id', 'test-user-id');
      expect(responseObject.body).toHaveProperty('username', 'testuser');
      expect(responseObject.body).toHaveProperty('preferences');
      expect(responseObject.message).toBe('User created successfully');
    });

    it('should return 400 if user already exists', async () => {
      // Mock request data
      mockRequest = {
        body: {
          username: 'existinguser',
          password: 'password123'
        }
      };

      // Mock User.findOne to simulate existing user
      (User.findOne as jest.Mock).mockResolvedValue({
        id: 'existing-user-id',
        username: 'existinguser'
      });

      // Call the controller
      await signup(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'existinguser' });
      expect(User.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('failure');
      expect(responseObject.message).toBe('User already exists');
    });

    it('should return 400 if validation fails', async () => {
      // Mock request with invalid data (missing password)
      mockRequest = {
        body: {
          username: 'testuser'
        }
      };

      // Call the controller
      await signup(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('failure');
    });

    it('should return 500 if an error occurs', async () => {
      // Mock request data
      mockRequest = {
        body: {
          username: 'testuser',
          password: 'password123'
        }
      };

      // Mock User.findOne to throw an error
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Call the controller
      await signup(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('failure');
    });
  });

  describe('signin', () => {
    it('should authenticate user and return token', async () => {
      // Mock request data
      mockRequest = {
        body: {
          username: 'testuser',
          password: 'password123'
        }
      };

      // Mock user with comparePassword method
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        role: 'user',
        preferences: ['tech', 'science'],
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      // Mock User.findOne to return the user
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock generateToken to return a token
      (generateToken as jest.Mock).mockReturnValue('mocked-jwt-token');

      // Call the controller
      await signin(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('success');
      expect(responseObject.body).toHaveProperty('token', 'Bearer mocked-jwt-token');
      expect(responseObject.message).toBe('User authenticated successfully');
    });

    it('should return 401 if user not found', async () => {
      // Mock request data
      mockRequest = {
        body: {
          username: 'nonexistentuser',
          password: 'password123'
        }
      };

      // Mock User.findOne to return null (user not found)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Call the controller
      await signin(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistentuser' });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('failure');
      expect(responseObject.message).toBe('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      // Mock request data
      mockRequest = {
        body: {
          username: 'testuser',
          password: 'wrongpassword'
        }
      };

      // Mock user with comparePassword method that returns false
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      // Mock User.findOne to return the user
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Call the controller
      await signin(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('failure');
      expect(responseObject.message).toBe('Invalid credentials');
    });

    it('should return 400 if validation fails', async () => {
      // Mock request with invalid data (missing password)
      mockRequest = {
        body: {
          username: 'testuser'
        }
      };

      // Call the controller
      await signin(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('failure');
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user profile', async () => {
      // Mock authenticated user in request
      mockRequest = {
        user: {
          id: 'test-user-id',
          username: 'testuser',
          password: 'password123',
          role: 'user',
          preferences: ['tech', 'science']
        } as any
      };

      // Mock user data returned from database
      const mockUserData = {
        id: 'test-user-id',
        username: 'testuser',
        role: 'user',
        preferences: ['tech', 'science']
      };

      // Mock User.findOne to return the user
      (User.findOne as jest.Mock).mockResolvedValue(mockUserData);

      // Call the controller
      await getCurrentUser(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('success');
      expect(responseObject.body).toEqual(mockUserData);
      expect(responseObject.message).toBe('User profile retrieved successfully');
    });

    it('should return 404 if user not found', async () => {
      // Mock authenticated user in request
      mockRequest = {
        user: {
          id: 'nonexistent-user-id',
          username: 'testuser',
          password: 'password123',
          role: 'user',
          preferences: []
        } as any
      };

      // Mock User.findOne to return null (user not found)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Call the controller
      await getCurrentUser(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ id: 'nonexistent-user-id' });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toBeInstanceOf(ApiResponse);
      expect(responseObject.status).toBe('failure');
      expect(responseObject.message).toBe('User not found');
    });
  });
}); 