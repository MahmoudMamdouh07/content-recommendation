import { getCache, setCache, invalidateCache } from '../config';

class CacheService {
  /**
   * Get cached data for a key
   */
  async getFromCache<T>(key: string): Promise<T | null> {
    try {
      return getCache<T>(key);
    } catch (error) {
      console.error('Error getting data from cache:', error);
      return null;
    }
  }

  /**
   * Set data in cache with expiry time
   */
  async setInCache<T>(key: string, data: T, expiryInSeconds: number = 3600): Promise<void> {
    try {
      await setCache(key, data, expiryInSeconds);
    } catch (error) {
      console.error('Error setting data in cache:', error);
    }
  }

  /**
   * Delete data from cache for a key
   */
  async deleteFromCache(key: string): Promise<void> {
    try {
      await invalidateCache(key);
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  /**
   * Generate recommendation cache key
   */
  generateRecommendationCacheKey(userId: string, options: any): string {
    return `recommendations:${userId}:${JSON.stringify(options)}`;
  }

  /**
   * Generate filtered content cache key
   */
  generateFilteredContentCacheKey(options: any): string {
    return `filteredContent:${JSON.stringify(options)}`;
  }

  /**
   * Generate content list cache key
   */
  generateContentListCacheKey(options: any): string {
    return `content:list:${JSON.stringify(options)}`;
  }
}

export default new CacheService(); 