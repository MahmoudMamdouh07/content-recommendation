import { Content, IContent } from '../models';
import CacheService from './CacheService';

interface ContentQueryOptions {
  type?: string;
  tags?: string[];
  skip?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

class ContentService {
  /**
   * Create a new content item
   */
  async createContent(contentData: Partial<IContent>): Promise<IContent> {
    try {
      const newContent = new Content(contentData);
      const savedContent = await newContent.save();
      
      return savedContent;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  /**
   * Get all content with pagination and filtering
   */
  async getAllContent(options: ContentQueryOptions = {}): Promise<{ content: IContent[], total: number }> {
    try {
      const { 
        type, 
        tags, 
        skip = 0, 
        limit = 10, 
        sortField = 'createdAt', 
        sortOrder = 'desc' 
      } = options;
      
      // Build query
      let query = Content.find();
      
      // Apply filters
      if (type) {
        query = query.where('type').equals(type);
      }
      
      if (tags && tags.length > 0) {
        query = query.where('tags').in(tags);
      }
      
      // Generate cache key
      const cacheKey = CacheService.generateContentListCacheKey(options);
      
      // Try to get from cache
      const cachedData = await CacheService.getFromCache<{ content: IContent[], total: number }>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // If not in cache, query database
      const total = await Content.countDocuments(query.getQuery());
      
      // Apply sort, skip, and limit
      const sortObject: Record<string, 1 | -1> = {};
      sortObject[sortField] = sortOrder === 'asc' ? 1 : -1;
      
      const content = await query
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .exec();
      
      const result = { content, total };
      
      // Cache for 15 minutes
      await CacheService.setInCache(cacheKey, result, 15 * 60);
      
      return result;
    } catch (error) {
      console.error('Error getting all content:', error);
      throw error;
    }
  }

  /**
   * Increment content popularity
   */
  async incrementPopularity(id: string, amount: number = 1): Promise<IContent | null> {
    try {
      const content = await Content.findOneAndUpdate(
        { id },
        { $inc: { popularity: amount } },
        { new: true }
      );
      
      if (content) {
        // Update cache
        const cacheKey = `content:${id}`;
        await CacheService.setInCache(cacheKey, content, 30 * 60);
      }
      
      return content;
    } catch (error) {
      console.error('Error incrementing content popularity:', error);
      throw error;
    }
  }

  /**
   * Filter content by type
   */
  async searchContent(type: string, options: ContentQueryOptions = {}): Promise<IContent[]> {
    try {
      const { 
        skip = 0, 
        limit = 10 
      } = options;
      
      // Generate cache key for filtered results
      const cacheKey = `content:filter:${type}:${JSON.stringify(options)}`;
      
      // Try to get from cache
      const cachedResults = await CacheService.getFromCache<IContent[]>(cacheKey);
      
      if (cachedResults) {
        return cachedResults;
      }
      
      // Build query with type filter
      const query = Content.find().where('type').equals(type);
      
      // Execute query with pagination
      const results = await query
        .sort({ popularity: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
      // Cache results for 10 minutes
      await CacheService.setInCache(cacheKey, results, 10 * 60);
      
      return results;
    } catch (error) {
      console.error('Error filtering content by type:', error);
      throw error;
    }
  }
}

export default new ContentService(); 