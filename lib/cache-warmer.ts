import { warmComponentCache } from "@/ui/block-parser";

// List of your most commonly used blocks
const COMMON_BLOCKS = [
  'core/paragraph',
  'core/heading', 
  'core/image',
  'core/group',
  'core/columns',
  'core/column',
  'acf/sommet--hero',
  'acf/sommet--degree-hero',
  'acf/sommet--text-and-image',
  'acf/sommet--header',
  'acf/sommet--footer',
  'acf/sommet--carousel',
  'acf/sommet--text-section',
];

// Cache warming function that can be called during app initialization
export const initializeComponentCache = async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      await warmComponentCache(COMMON_BLOCKS);
    } catch (error) {
      console.warn('Cache warming failed, but app will continue:', error);
    }
  }
};

// For development - monitor cache performance
export const logCachePerformance = () => {
  if (process.env.NODE_ENV === 'development') {
    const { getCacheStats } = require('@/ui/block-parser');
    console.log('Block component cache stats:', getCacheStats());
  }
};