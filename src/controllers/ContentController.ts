import { Request, Response } from 'express';
import { ContentService } from '../services';
import { ApiResponse } from '../utils/apiResponse';

class ContentController {
  /**
   * Create a new content item
   */
  async createContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await ContentService.createContent(req.body);
      res.status(201).json(
        new ApiResponse(content, 'Content created successfully')
      );
    } catch (error: any) {
      console.error('Error in createContent controller:', error);
      res.status(400).json(
        new ApiResponse(null, error.message || 'Error creating content', 'failure')
      );
    }
  }

  /**
   * Get all content with pagination and filtering
   */
  async getAllContent(req: Request, res: Response): Promise<void> {
    try {
      const { 
        type, 
        tags, 
        page = '1', 
        limit = '10',
        sortField = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Parse query parameters
      const options = {
        type: type as string | undefined,
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        limit: parseInt(limit as string),
        sortField: sortField as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };
      
      const result = await ContentService.getAllContent(options);
      
      res.status(200).json(
        new ApiResponse({
          content: result.content,
          total: result.total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(result.total / parseInt(limit as string))
        }, 'Content retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getAllContent controller:', error);
      res.status(500).json(
        new ApiResponse(null, error.message || 'Error getting content', 'failure')
      );
    }
  }

  /**
   * Filter content by type
   */
  async searchContent(req: Request, res: Response): Promise<void> {
    try {
      const { type, page = '1', limit = '10' } = req.query;
      
      const options = {
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        limit: parseInt(limit as string)
      };
      
      const results = await ContentService.searchContent(type as string, options);
      
      res.status(200).json(
        new ApiResponse(results, 'Content filtered by type successfully')
      );
    } catch (error: any) {
      console.error('Error in content filter controller:', error);
      res.status(500).json(
        new ApiResponse(null, error.message || 'Error filtering content', 'failure')
      );
    }
  }
}

export default new ContentController(); 