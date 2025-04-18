import { Request, Response } from 'express';
import { RecommendationService, CacheService } from '../services';
import { ApiResponse } from '../utils/apiResponse';

class RecommendationController {
  /**
   * Get personalized content recommendations for a user
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      // Use either the userId from params or the authenticated user
      const userId = req.params.userId || req.user?.id;
      
      if (!userId) {
        res.status(400).json(
          new ApiResponse(null, 'User ID is required', 'failure')
        );
        return;
      }
      
      // If the userId in params doesn't match the authenticated user and user is not admin, deny access
      if (req.params.userId && req.params.userId !== req.user?.id && req.user?.role !== 'admin') {
        res.status(403).json(
          new ApiResponse(null, 'You are not authorized to view this user\'s recommendations', 'failure')
        );
        return;
      }
      
      const { limit, type, tags } = req.query;
      
      // Parse query parameters
      const options = {
        limit: limit ? parseInt(limit as string) : 10,
        type: type as string | undefined,
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined
      };
      
      
      // Get recommendations
      const recommendations = await RecommendationService.getRecommendations(userId, options);
            
      res.status(200).json(
        new ApiResponse(recommendations, 'Recommendations retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getRecommendations controller:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        new ApiResponse(null, error.message || 'An error occurred while getting recommendations', 'failure')
      );
    }
  }

  /**
   * Filter content based on criteria
   */
  async filterContent(req: Request, res: Response): Promise<void> {
    try {      
      const { type, tags, limit, offset } = req.query;
      
      // Parse query parameters
      const options = {
        type: type as string | undefined,
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
        limit: limit ? parseInt(limit as string) : 10,
        offset: offset ? parseInt(offset as string) : 0
      };
      
      // Get filtered content
      const content = await RecommendationService.filterContent(options);
            
      res.status(200).json(
        new ApiResponse(content, 'Filtered content retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in filterContent controller:', error);
      res.status(500).json(
        new ApiResponse(null, error.message || 'An error occurred while filtering content', 'failure')
      );
    }
  }
}

export default new RecommendationController(); 