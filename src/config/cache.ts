import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

export { redisClient, connectRedis };

// Ensure Redis client is connected before performing operations
const ensureRedisConnected = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await connectRedis();
  }
};

// Update cache functions to ensure connection
export const setCache = async (key: string, value: any, expiryInSeconds: number = 3600): Promise<void> => {
  try {
    await ensureRedisConnected();
    await redisClient.set(key, JSON.stringify(value), { EX: expiryInSeconds });
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    await ensureRedisConnected();
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await ensureRedisConnected();
    await redisClient.del(key);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}; 