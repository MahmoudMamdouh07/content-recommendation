import { InteractionService } from '../services';
import { User, Content, Interaction } from '../models';
import CacheService from '../services/CacheService';

// Mock CacheService
jest.mock('../services/CacheService', () => ({
  deleteFromCache: jest.fn().mockResolvedValue(true)
}));

// Mock the models
jest.mock('../models', () => {
  // Properly mock the Interaction constructor
  const mockInteractionInstance = {
    userId: '',
    contentId: '',
    type: '',
    timestamp: new Date(),
    duration: 0,
    comment: '',
    save: jest.fn().mockResolvedValue(true)
  };

  // Create predefined mock interactions
  const mockInteractions = [
    { userId: 'test-user-id', contentId: 'content-1', type: 'view', duration: 120 },
    { userId: 'test-user-id', contentId: 'content-2', type: 'like' }
  ];

  // Constructor function for Interaction
  function MockInteraction(data: any) {
    Object.assign(mockInteractionInstance, data);
    return mockInteractionInstance;
  }

  return {
    User: {
      findOne: jest.fn().mockResolvedValue({ id: 'test-user-id' })
    },
    Content: {
      findOne: jest.fn().mockResolvedValue({ id: 'test-content-id' }),
      updateOne: jest.fn().mockResolvedValue({ nModified: 1 })
    },
    Interaction: Object.assign(
      function() { return mockInteractionInstance; },
      {
        find: jest.fn((query) => {
          if (query && query.userId === 'test-user-id') {
            // For getUserInteractions test
            return {
              where: jest.fn().mockReturnThis(),
              equals: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue(mockInteractions)
            };
          }
          
          // Default empty response
          return {
            where: jest.fn().mockReturnThis(),
            equals: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([])
          };
        }),
        prototype: {
          save: jest.fn().mockResolvedValue(true)
        }
      }
    )
  };
});

describe('InteractionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordInteraction', () => {
    it('should throw an error if user is not found', async () => {
      // Mock User.findOne to return null (user not found)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(InteractionService.recordInteraction({
        userId: 'test-user-id',
        contentId: 'test-content-id',
        type: 'view',
        duration: 120
      })).rejects.toThrow('User not found');
    });

    it('should throw an error if content is not found', async () => {
      // Mock User.findOne to return a user but Content.findOne to return null
      (User.findOne as jest.Mock).mockResolvedValue({ id: 'test-user-id' });
      (Content.findOne as jest.Mock).mockResolvedValue(null);

      await expect(InteractionService.recordInteraction({
        userId: 'test-user-id',
        contentId: 'test-content-id',
        type: 'view',
        duration: 120
      })).rejects.toThrow('Content not found');
    });

    it('should record a view interaction successfully with duration', async () => {
      // Mock user and content
      (User.findOne as jest.Mock).mockResolvedValue({ id: 'test-user-id' });
      (Content.findOne as jest.Mock).mockResolvedValue({ id: 'test-content-id' });
      
      await InteractionService.recordInteraction({
        userId: 'test-user-id',
        contentId: 'test-content-id',
        type: 'view',
        duration: 120
      });
      
      expect(User.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(Content.findOne).toHaveBeenCalledWith({ id: 'test-content-id' });
      expect(Content.updateOne).toHaveBeenCalled();
      expect(CacheService.deleteFromCache).toHaveBeenCalled();
    });

    it('should record a comment interaction successfully with comment text', async () => {
      // Mock user and content
      (User.findOne as jest.Mock).mockResolvedValue({ id: 'test-user-id' });
      (Content.findOne as jest.Mock).mockResolvedValue({ id: 'test-content-id' });
      
      await InteractionService.recordInteraction({
        userId: 'test-user-id',
        contentId: 'test-content-id',
        type: 'comment',
        comment: 'This is a test comment'
      });
      
      expect(User.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(Content.findOne).toHaveBeenCalledWith({ id: 'test-content-id' });
      expect(Content.updateOne).toHaveBeenCalled();
    });

    it('should record a like interaction successfully', async () => {
      // Mock user and content
      (User.findOne as jest.Mock).mockResolvedValue({ id: 'test-user-id' });
      (Content.findOne as jest.Mock).mockResolvedValue({ id: 'test-content-id' });
      
      await InteractionService.recordInteraction({
        userId: 'test-user-id',
        contentId: 'test-content-id',
        type: 'like'
      });
      
      expect(User.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(Content.findOne).toHaveBeenCalledWith({ id: 'test-content-id' });
      expect(Content.updateOne).toHaveBeenCalled();
    });
  });

  describe('getUserInteractions', () => {
    it('should return user interactions', async () => {
      // Setup mock interactions
      const mockInteractions = [
        { userId: 'test-user-id', contentId: 'content-1', type: 'view', duration: 120 },
        { userId: 'test-user-id', contentId: 'content-2', type: 'like' }
      ];
      
      // The result of getUserInteractions
      const result = await InteractionService.getUserInteractions('test-user-id');
      
      expect(Interaction.find).toHaveBeenCalledWith({ userId: 'test-user-id' });
      expect(result).toEqual(mockInteractions);
    });
  });
}); 