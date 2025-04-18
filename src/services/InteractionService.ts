import { Interaction, Content, User } from '../models';
import CacheService from './CacheService';

interface InteractionData {
  userId: string;
  contentId: string;
  type: 'view' | 'like' | 'share' | 'comment' | 'save';
  duration?: number;
  comment?: string;
}

class InteractionService {
  /**
   * Validate user exists
   */
  private async validateUser(userId: string): Promise<void> {
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
  }

  /**
   * Validate content exists
   */
  private async validateContent(contentId: string): Promise<void> {
    const content = await Content.findOne({ id: contentId });
    if (!content) {
      throw new Error('Content not found');
    }
  }

  /**
   * Calculate popularity increment based on interaction type
   */
  private calculatePopularityIncrement(type: string): number {
    switch (type) {
      case 'view':
        return 1;
      case 'like':
        return 3;
      case 'share':
        return 4;
      case 'comment':
        return 5;
      case 'save':
        return 5;
      default:
        return 0;
    }
  }

  /**
   * Record a user interaction with content
   */
  async recordInteraction(data: InteractionData): Promise<any> {
    try {
      // Run independent validations concurrently
      await Promise.all([
        this.validateUser(data.userId),
        this.validateContent(data.contentId)
      ]);
      
      // Create new interaction
      const interaction = new Interaction({
        userId: data.userId,
        contentId: data.contentId,
        type: data.type,
        timestamp: new Date(),
        duration: data.duration,
        comment: data.comment
      });
      
      // Calculate popularity increment
      const popularityIncrement = this.calculatePopularityIncrement(data.type);
      
      // Perform independent operations concurrently
      const [savedInteraction] = await Promise.all([
        interaction.save(),
        Content.updateOne(
          { id: data.contentId },
          { $inc: { popularity: popularityIncrement } }
        ),
        CacheService.deleteFromCache(`recommendations:${data.userId}`)
      ]);
      
      return savedInteraction;
    } catch (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }
  }
  
  /**
   * Get user's interactions
   */
  async getUserInteractions(userId: string, type?: string): Promise<any[]> {
    try {
      // First check if user exists
      await this.validateUser(userId);
      
      // Build query
      let query = Interaction.find({ userId });
      
      if (type) {
        query = query.where('type').equals(type);
      }
      
      return query.sort({ timestamp: -1 }).exec();
    } catch (error) {
      console.error('Error getting user interactions:', error);
      throw error;
    }
  }
  
  /**
   * Get interactions for a content item
   */
  async getContentInteractions(contentId: string, type?: string): Promise<any[]> {
    try {
      // First check if content exists
      await this.validateContent(contentId);
      
      // Build query
      let query = Interaction.find({ contentId });
      
      if (type) {
        query = query.where('type').equals(type);
      }
      
      return query.sort({ timestamp: -1 }).exec();
    } catch (error) {
      console.error('Error getting content interactions:', error);
      throw error;
    }
  }
}

export default new InteractionService(); 