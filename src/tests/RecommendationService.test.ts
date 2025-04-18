import { RecommendationService } from '../services';
import { User, Content, Interaction } from '../models';
import CacheService from '../services/CacheService';

// Mock CacheService
jest.mock('../services/CacheService', () => ({
  getFromCache: jest.fn().mockResolvedValue(null),
  setInCache: jest.fn().mockResolvedValue(true)
}));

// Mock the models
jest.mock('../models', () => {
  // Create a mock array of interactions
  const mockInteractions = [
    { userId: 'test-user-id', contentId: 'content-1', type: 'view', duration: 120 },
    { userId: 'test-user-id', contentId: 'content-2', type: 'like' }
  ];

  // Mock content items
  const mockContent = [
    { id: 'content-1', title: 'Content 1', type: 'article', tags: ['technology'], popularity: 10 },
    { id: 'content-2', title: 'Content 2', type: 'video', tags: ['science'], popularity: 5 }
  ];

  // Mock Content.find method 
  const findMock = jest.fn();
  const whereMock = jest.fn();
  const equalsMock = jest.fn();
  const inMock = jest.fn();
  const limitMock = jest.fn();
  const sortMock = jest.fn();
  const execMock = jest.fn();

  // Chain mocks properly
  whereMock.mockReturnValue({ equals: equalsMock, in: inMock });
  equalsMock.mockReturnValue({ where: whereMock, limit: limitMock, sort: sortMock, exec: execMock });
  inMock.mockReturnValue({ where: whereMock, limit: limitMock, sort: sortMock, exec: execMock });
  limitMock.mockReturnValue({ where: whereMock, sort: sortMock, exec: execMock });
  sortMock.mockReturnValue({ where: whereMock, limit: limitMock, exec: execMock });
  execMock.mockResolvedValue(mockContent);
  
  findMock.mockImplementation((query) => {
    // If looking for specific content IDs, return those content items
    if (query && query.id && query.id.$in) {
      const contentIds = query.id.$in;
      return mockContent.filter(c => contentIds.includes(c.id));
    }

    // Otherwise, return the chainable mocks
    return {
      where: whereMock,
      limit: limitMock,
      sort: sortMock,
      exec: execMock
    };
  });

  return {
    User: {
      findOne: jest.fn().mockResolvedValue({
        id: 'test-user-id',
        username: 'testuser',
        preferences: ['technology', 'science']
      })
    },
    Content: {
      find: findMock
    },
    Interaction: {
      find: jest.fn(() => {
        // Return the mock array when find is executed directly
        return mockInteractions;
      })
    },
    // Export mock functions for assertions
    mockFunctions: {
      whereMock,
      equalsMock,
      limitMock,
      execMock
    }
  };
});

// Access the exported mock functions
const { mockFunctions } = jest.requireMock('../models');

describe('RecommendationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should throw an error if user is not found', async () => {
      // Mock User.findOne to return null (user not found)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(RecommendationService.getRecommendations('test-user-id'))
        .rejects
        .toThrow('User not found');
    });

    it('should return recommendations when user exists', async () => {
      // Mock user
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        preferences: ['technology', 'science']
      };

      // Mock interactions with new types - this should be in an array format with map available
      const mockInteractions = [
        { userId: 'test-user-id', contentId: 'content-1', type: 'view', duration: 120 },
        { userId: 'test-user-id', contentId: 'content-2', type: 'like' },
        { userId: 'test-user-id', contentId: 'content-3', type: 'comment', comment: 'Great article!' }
      ];

      // Mock content
      const mockContent = [
        { 
          id: 'content-4', 
          title: 'Article 4', 
          type: 'article', 
          tags: ['technology'], 
          popularity: 10,
          createdAt: new Date()
        },
        { 
          id: 'content-5', 
          title: 'Video 5', 
          type: 'video', 
          tags: ['science'], 
          popularity: 5,
          createdAt: new Date()
        }
      ];

      // Setup mocks
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      
      // Make Interaction.find return the array directly
      (Interaction.find as jest.Mock).mockReturnValue(mockInteractions);
      
      // Make Content.find().exec() return our mock content
      mockFunctions.execMock.mockResolvedValue(mockContent);

      const result = await RecommendationService.getRecommendations('test-user-id');

      expect(result).toBeDefined();
      expect(User.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(Interaction.find).toHaveBeenCalledWith({ userId: 'test-user-id' });
      expect(Content.find).toHaveBeenCalled();
    });

    it('should apply type and limit filters', async () => {
      // Mock user
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        preferences: ['technology']
      };

      // Mock interactions - array format with map available
      const mockInteractions = [
        { userId: 'test-user-id', contentId: 'content-1', type: 'view', duration: 90 }
      ];

      // Mock content
      const mockContent = [
        { 
          id: 'content-2', 
          title: 'Article 2', 
          type: 'article', 
          tags: ['technology'], 
          popularity: 10,
          createdAt: new Date()
        }
      ];

      // Setup mocks
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Interaction.find as jest.Mock).mockReturnValue(mockInteractions);
      mockFunctions.execMock.mockResolvedValue(mockContent);

      await RecommendationService.getRecommendations('test-user-id', { type: 'article', limit: 5 });

      // Check the proper filters were applied
      expect(Content.find).toHaveBeenCalled();
      expect(mockFunctions.whereMock).toHaveBeenCalledWith('type');
      expect(mockFunctions.equalsMock).toHaveBeenCalledWith('article');
      expect(mockFunctions.execMock).toHaveBeenCalled();
    });
  });
}); 