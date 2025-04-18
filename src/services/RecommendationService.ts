import { IUser, IContent, User, Content, Interaction, IInteraction } from '../models';
import { 
  calculateContentScore, 
  sortContentByScore,
  filterContentByType,
  filterContentByTags
} from '../utils/RecommendationUtils';
import CacheService from './CacheService';

// Define interface for enriched interaction
interface EnrichedInteraction extends IInteraction {
  contentData?: IContent;
  toObject(): any;
}

interface RecommendationOptions {
  limit?: number;
  type?: string;
  tags?: string[];
  skipContentIds?: string[];
}

class RecommendationService {
  /**
   * Find user by ID
   */
  private async findUser(userId: string): Promise<IUser> {
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Get user interactions with content details
   */
  private async getUserInteractions(userId: string): Promise<IInteraction[]> {
    return Interaction.find({ userId });
  }

  /**
   * Get details of content that user has interacted with
   */
  private async getInteractedContent(contentIds: string[]): Promise<Map<string, IContent>> {
    if (!contentIds.length) return new Map();
    
    const interactedContent = await Content.find({ id: { $in: contentIds } });
    const contentMap = new Map<string, IContent>();
    
    interactedContent.forEach(content => {
      contentMap.set(content.id, content);
    });
    
    return contentMap;
  }

  /**
   * Build content query 
   */
  private buildContentQuery(
    interactedContentIds: string[], 
    skipContentIds: string[],
    options: RecommendationOptions
  ): any {
    // Combine the IDs to exclude
    const excludeIds = [...new Set([...interactedContentIds, ...skipContentIds])];
    
    let contentQuery = Content.find({
      id: { $nin: excludeIds }
    });
    
    // Apply type filter if specified
    if (options.type) {
      contentQuery = contentQuery.where('type').equals(options.type);
    }
    
    // Apply tags filter if specified
    if (options.tags && options.tags.length > 0) {
      contentQuery = contentQuery.where('tags').in(options.tags);
    }
    
    return contentQuery;
  }

  /**
   * Score and sort content
   */
  private scoreAndSortContent(
    availableContent: IContent[], 
    user: IUser, 
    interactions: IInteraction[],
    interactedContentMap: Map<string, IContent>,
    limit: number
  ): IContent[] {
    // Enrich interactions with content data
    const enrichedInteractions = interactions
      .map(interaction => {
        const contentData = interactedContentMap.get(interaction.contentId);
        if (!contentData) return null;
        
        // Create enriched interaction by adding contentData
        const enriched = interaction as EnrichedInteraction;
        enriched.contentData = contentData;
        return enriched;
      })
      .filter(i => i !== null) as EnrichedInteraction[];
    
    // Score each content item using the enriched interactions
    const scoredContent = availableContent.map(content => {
      const score = calculateContentScore(content, user, enrichedInteractions);
      return { content, score };
    });
    
    // Sort by score (highest first) and return the top results
    const sortedContent = sortContentByScore(scoredContent);
    return sortedContent.slice(0, limit).map(item => item.content);
  }

  /**
   * Get personalized content recommendations for a user
   */
  async getRecommendations(
    userId: string, 
    options: RecommendationOptions = {}
  ): Promise<IContent[]> {
    try {      
      // Set defaults
      const limit = options.limit || 10;
      const skipContentIds = options.skipContentIds || [];
      
      // Try to get from cache
      const cacheKey = `recommendations:${userId}:${JSON.stringify(options)}`;
      const cachedRecommendations = await CacheService.getFromCache<IContent[]>(cacheKey);
      
      if (cachedRecommendations && cachedRecommendations.length > 0) {
        return cachedRecommendations;
      }
      
      // Find user and their interactions
      const [user, interactions] = await Promise.all([
        this.findUser(userId),
        this.getUserInteractions(userId)
      ]);
      
      
      // Get IDs of content the user has interacted with
      const interactedContentIds = interactions.map(i => i.contentId);
      
      // Load the full content data for all interactions
      const interactedContentMap = await this.getInteractedContent(interactedContentIds);
      
      // Find content not yet interacted with
      const contentQuery = this.buildContentQuery(
        interactedContentIds, 
        skipContentIds,
        options
      );
      
      const availableContent = await contentQuery.exec();
      
      if (availableContent.length === 0) {
        return [];
      }
      
      // Score and sort available content based on user preferences and interactions
      const recommendations = this.scoreAndSortContent(
        availableContent, 
        user, 
        interactions,
        interactedContentMap,
        limit
      );
            
      // Cache the results for 30 minutes
      if (recommendations.length > 0) {
        await CacheService.setInCache(cacheKey, recommendations, 30 * 60);
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Filter content based on criteria
   */
  async filterContent(
    options: { 
      type?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<IContent[]> {
    try {
      const limit = options.limit || 10;
      const offset = options.offset || 0;
      
      // Generate cache key
      const cacheKey = `filteredContent:${JSON.stringify(options)}`;
      
      // Try to get from cache
      const cachedContent = await CacheService.getFromCache<IContent[]>(cacheKey);
      if (cachedContent && cachedContent.length > 0) {
        return cachedContent;
      }
      
      // Build query
      let query = Content.find();
      
      if (options.type) {
        query = query.where('type').equals(options.type);
      }
      
      if (options.tags && options.tags.length > 0) {
        query = query.where('tags').in(options.tags);
      }
      
      // Sort by popularity and recency
      query = query.sort({ popularity: -1, createdAt: -1 });
      
      // Apply pagination
      query = query.skip(offset).limit(limit);
      
      // Execute query
      const content = await query.exec();      
      // Cache results
      if (content.length > 0) {
        await CacheService.setInCache(cacheKey, content, 15 * 60); // 15 minutes
      }
      
      return content;
    } catch (error) {
      console.error('Error filtering content:', error);
      throw error;
    }
  }
}

export default new RecommendationService(); 