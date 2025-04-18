import { Request, Response } from 'express';
import { InteractionService } from '../services';
import { ApiResponse } from '../utils/apiResponse';

// Define the possible interaction types
type InteractionType = 'view' | 'like' | 'share' | 'comment' | 'save' | 'rating';

// Define the expected interaction data structure
interface InteractionData {
  userId: string;
  contentId: string;
  type: InteractionType;
  duration?: number;
  comment?: string;
  rating?: number;
}

class InteractionController {
  /**
   * Record a user interaction with content
   */
  async recordInteraction(req: Request, res: Response): Promise<void> {    
    try {
      // Get userId from authenticated user instead of request body
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json(
          new ApiResponse(null, 'User authentication required', 'failure')
        );
        return;
      }
      
      const { contentId, type, duration, comment, rating } = req.body;
      
      // Record the interaction
      const interactionData: InteractionData = {
        userId,
        contentId,
        type: type as InteractionType,
        duration,
        comment,
        rating
      };
      
      const interaction = await InteractionService.recordInteraction(interactionData);
      
      res.status(201).json(
        new ApiResponse(interaction, 'Interaction recorded successfully')
      );
    } catch (error: any) {
      console.error('Error in recordInteraction controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        new ApiResponse(null, error.message || 'An error occurred while recording the interaction', 'failure')
      );
    }
  }
  
  /**
   * Get user's interactions
   */
  async getUserInteractions(req: Request, res: Response): Promise<void> {
    try {
      // Use either the userId from params or the authenticated user
      // This allows admins to view any user's interactions but regular users to see only their own
      let userId = req.params.userId;
      
      // If the userId in params doesn't match the authenticated user and user is not admin, deny access
      if (userId !== req.user?.id && req.user?.role !== 'admin') {
        res.status(403).json(
          new ApiResponse(null, 'You are not authorized to view this user\'s interactions', 'failure')
        );
        return;
      }
      
      const { type } = req.query;
      
      const interactions = await InteractionService.getUserInteractions(
        userId, 
        type as string | undefined
      );
      
      res.status(200).json(
        new ApiResponse(interactions, 'User interactions retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserInteractions controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        new ApiResponse(null, error.message || 'An error occurred while getting user interactions', 'failure')
      );
    }
  }

  /**
   * Get average rating for content
   */
  async getContentRating(req: Request, res: Response): Promise<void> {
    try {
      const contentId = req.params.contentId;
      
      const averageRating = await InteractionService.getContentAverageRating(contentId);
      
      if (averageRating === null) {
        res.status(200).json(
          new ApiResponse({ rating: null, ratingCount: 0 }, 'Content has no ratings yet')
        );
        return;
      }
      
      // Get all rating interactions to count them
      const ratingInteractions = await InteractionService.getContentInteractions(contentId, 'rating');
      
      res.status(200).json(
        new ApiResponse({
          rating: averageRating,
          ratingCount: ratingInteractions.length
        }, 'Content rating retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getContentRating controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        new ApiResponse(null, error.message || 'An error occurred while getting content rating', 'failure')
      );
    }
  }
}

export default new InteractionController(); 