import { IContent, IUser, IInteraction } from '../models';

interface ContentScore {
  content: IContent;
  score: number;
}

// Define interface for enriched interaction data
interface EnrichedInteraction extends IInteraction {
  contentData?: IContent;
}

/**
 * Calculate a score for a content item based on user preferences and interactions
 */
export const calculateContentScore = (
  content: IContent,
  user: IUser,
  userInteractions: EnrichedInteraction[]
): number => {
  let score = 0;
  
  // Base score: match between content tags and user preferences
  const matchingTags = content.tags.filter(tag => user.preferences.includes(tag));
  score += matchingTags.length * 2; // Weight preference matches
  
  // Freshness score: Newer content gets a higher score
  const contentAge = Date.now() - new Date(content.createdAt).getTime();
  const daysSinceCreation = contentAge / (1000 * 60 * 60 * 24);
  score += Math.max(0, 5 - daysSinceCreation / 7); // Higher score for content less than a month old
  
  // Popularity score
  score += Math.min(5, content.popularity / 10); // Cap at 5 points
  
  // Extract all tags from content the user has interacted with
  const interactionTags = new Set<string>();
  let hasSimilarTypeInteraction = false;
  
  // Different interactions have different weights
  const interactionTypeWeights = {
    'view': 1,
    'like': 3,
    'share': 4,
    'comment': 3.5,
    'save': 4.5
  };
  
  // Process user interactions to build preference profile
  userInteractions.forEach(interaction => {
    if (!interaction.contentData) return;
    
    // Get weight for this interaction type
    const weight = interactionTypeWeights[interaction.type as keyof typeof interactionTypeWeights] || 1;
    
    // Add all tags from this content to our set of interaction tags
    interaction.contentData.tags.forEach(tag => interactionTags.add(tag));
    
    // Check for similar content type
    if (interaction.contentData.type === content.type) {
      hasSimilarTypeInteraction = true;
      score += weight / 2; // Add half the weight for type match
    }
  });
  
  // Boost score for content with tags matching user's interaction history
  const matchingInteractionTags = content.tags.filter(tag => interactionTags.has(tag));
  score += matchingInteractionTags.length * 1.5;
  
  // Recency boost
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentInteractions = userInteractions.filter(i => 
    i.timestamp > oneWeekAgo && i.contentData
  );
  
  if (recentInteractions.length > 0) {
    // Get all tags from recent interactions
    const recentTags = new Set<string>();
    recentInteractions.forEach(interaction => {
      if (interaction.contentData) {
        interaction.contentData.tags.forEach(tag => recentTags.add(tag));
      }
    });
    
    // Boost score for content with tags matching recent interactions
    const matchingRecentTags = content.tags.filter(tag => recentTags.has(tag));
    score += matchingRecentTags.length * 2; // Higher weight for recency
  }
  
  return score;
};

/**
 * Sort content by score
 */
export const sortContentByScore = (scoredContent: ContentScore[]): ContentScore[] => {
  return scoredContent.sort((a, b) => b.score - a.score);
};

/**
 * Filter content based on type
 */
export const filterContentByType = (contentList: IContent[], type?: string): IContent[] => {
  if (!type) return contentList;
  return contentList.filter(content => content.type === type);
};

/**
 * Filter content based on tags
 */
export const filterContentByTags = (contentList: IContent[], tags?: string[]): IContent[] => {
  if (!tags || tags.length === 0) return contentList;
  return contentList.filter(content => 
    content.tags.some(tag => tags.includes(tag))
  );
}; 