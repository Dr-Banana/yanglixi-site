import { getR2Client, buildPublicR2Url } from './r2';
import { ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_BUCKET = process.env.R2_BUCKET;

export interface HomeKitchenPost {
  slug: string;
  title: string;
  date: string;
  description: string; // Simple description of what was eaten
  images: string[]; // Multiple images (like social media)
  holiday: string; // Holiday category (e.g., "Christmas Day")
  location?: string | null;
  tags?: string[] | null;
  published?: boolean;
}

// Alias for backwards compatibility
export type HomeKitchenRecipe = HomeKitchenPost;

/**
 * Check if R2 is configured
 */
function isR2Configured(): boolean {
  try {
    getR2Client();
    return !!R2_BUCKET;
  } catch (error) {
    return false;
  }
}

/**
 * Get all home kitchen posts from R2
 */
export async function getHomeKitchenRecipesFromR2(options: {
  holiday?: string;
  page?: number;
  pageSize?: number;
  includeDrafts?: boolean;
} = {}): Promise<{
  recipes: HomeKitchenPost[];
  total: number;
  pageCount: number;
}> {
  if (!isR2Configured()) {
    return { recipes: [], total: 0, pageCount: 1 };
  }

  try {
    const client = getR2Client();
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: 'HomeKitchen/',
    });

    const response = await client.send(command);
    const contents = response.Contents || [];

    const recipes: HomeKitchenPost[] = [];

    for (const item of contents) {
      if (!item.Key || !item.Key.endsWith('/post.json')) continue;

      try {
        const getCmd = new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: item.Key,
        });
        const data = await client.send(getCmd);
        const body = await data.Body?.transformToString();
        if (!body) continue;

        const post: HomeKitchenPost = JSON.parse(body);

        // Filter by published status
        if (!options.includeDrafts && post.published === false) {
          continue;
        }

        // Filter by holiday if specified
        if (options.holiday && post.holiday !== options.holiday) {
          continue;
        }

        // Build image URLs
        if (post.images && post.images.length > 0) {
          post.images = post.images.map((img, idx) => {
            if (img.startsWith('http')) return img;
            const imgKey = `HomeKitchen/${post.slug}/images/image-${idx}.jpg`;
            const publicUrl = buildPublicR2Url(imgKey);
            return publicUrl || img;
          });
        }

        recipes.push(post);
      } catch (err) {
        console.error('Error parsing post:', item.Key, err);
      }
    }

    // Sort by date (newest first)
    recipes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const page = options.page || 1;
    const pageSize = options.pageSize || 1000;
    const total = recipes.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginatedRecipes = recipes.slice(start, start + pageSize);

    return {
      recipes: paginatedRecipes,
      total,
      pageCount,
    };
  } catch (error) {
    console.error('Error fetching home kitchen posts from R2:', error);
    return { recipes: [], total: 0, pageCount: 1 };
  }
}

/**
 * Get a single home kitchen post by slug
 */
export async function getHomeKitchenRecipeBySlug(slug: string): Promise<HomeKitchenPost | null> {
  if (!isR2Configured()) {
    return null;
  }

  try {
    const client = getR2Client();
    const key = `HomeKitchen/${slug}/post.json`;

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    const response = await client.send(command);
    const body = await response.Body?.transformToString();
    
    if (!body) {
      return null;
    }

    const post: HomeKitchenPost = JSON.parse(body);

    // Build image URLs
    if (post.images && post.images.length > 0) {
      post.images = post.images.map((img, idx) => {
        if (img.startsWith('http')) return img;
        const imgKey = `HomeKitchen/${post.slug}/images/image-${idx}.jpg`;
        const publicUrl = buildPublicR2Url(imgKey);
        return publicUrl || img;
      });
    }

    return post;
  } catch (error) {
    console.error('Error fetching home kitchen post:', error);
    return null;
  }
}

/**
 * Save home kitchen post to R2
 */
export async function saveHomeKitchenRecipeToR2(post: HomeKitchenPost): Promise<void> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured');
  }

  try {
    const client = getR2Client();
    const key = `HomeKitchen/${post.slug}/post.json`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: JSON.stringify(post, null, 2),
      ContentType: 'application/json',
    });

    await client.send(command);
  } catch (error) {
    console.error('Error saving home kitchen post to R2:', error);
    throw error;
  }
}

/**
 * Upload image for home kitchen post
 */
export async function uploadHomeKitchenImage(
  slug: string,
  imageIndex: number,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured');
  }

  try {
    const client = getR2Client();
    const ext = contentType.split('/')[1] || 'jpg';
    const key = `HomeKitchen/${slug}/images/image-${imageIndex}.${ext}`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    
    await client.send(command);
    
    const publicUrl = buildPublicR2Url(key);
    return publicUrl || `/api/admin/home-kitchen/image/${slug}/${imageIndex}`;
  } catch (error) {
    console.error('Error uploading home kitchen image:', error);
    throw error;
  }
}

/**
 * Delete home kitchen recipe from R2
 */
export async function deleteHomeKitchenRecipeFromR2(slug: string): Promise<void> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured');
  }

  try {
    const client = getR2Client();

    // List all objects under this recipe's path
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: `HomeKitchen/${slug}/`,
    });

    const listResponse = await client.send(listCommand);
    const objects = listResponse.Contents || [];

    // Delete all objects
    for (const obj of objects) {
      if (!obj.Key) continue;
      
      await client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: obj.Key,
      }));
    }
  } catch (error) {
    console.error('Error deleting home kitchen recipe from R2:', error);
    throw error;
  }
}

/**
 * Get recipes count by holiday
 */
export async function getHomeKitchenRecipeCountByHoliday(): Promise<{ [holiday: string]: number }> {
  if (!isR2Configured()) {
    return {};
  }

  try {
    const result = await getHomeKitchenRecipesFromR2({ includeDrafts: false });
    const counts: { [holiday: string]: number } = {};

    result.recipes.forEach(recipe => {
      const holiday = recipe.holiday || 'Other';
      counts[holiday] = (counts[holiday] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error getting recipe counts:', error);
    return {};
  }
}

