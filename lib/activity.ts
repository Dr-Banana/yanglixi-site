import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, buildPublicR2Url } from './r2';

const R2_BUCKET = process.env.R2_BUCKET;

function isR2Configured(): boolean {
  try {
    getR2Client();
    return !!R2_BUCKET;
  } catch (error) {
    return false;
  }
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
  location?: string | null;
  link?: string | null;
  date: string;
  order: number;
  published: boolean;
}

export interface ActivityMetadata {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  link?: string | null;
  date: string;
  order: number;
  published: boolean;
}

const ACTIVITIES_INDEX_KEY = 'activities/index.json';

/**
 * Get all activities from R2
 */
export async function getActivitiesFromR2(options: {
  includeDrafts?: boolean;
} = {}): Promise<Activity[]> {
  // Return empty array if R2 is not configured
  if (!isR2Configured()) {
    return [];
  }

  try {
    const client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: ACTIVITIES_INDEX_KEY,
    });

    const response = await client.send(command);
    const body = await response.Body?.transformToString();
    
    if (!body) {
      return [];
    }

    const activities: Activity[] = JSON.parse(body);
    
    // Filter by published status
    let filtered = options.includeDrafts 
      ? activities 
      : activities.filter(a => a.published);
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return filtered;
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return [];
    }
    console.error('Error fetching activities from R2:', error);
    return [];
  }
}

/**
 * Save activity to R2
 */
export async function saveActivityToR2(activity: Activity): Promise<void> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set up R2 environment variables.');
  }

  try {
    const client = getR2Client();
    
    // Get existing activities
    const activities = await getActivitiesFromR2({ includeDrafts: true });
    
    // Find and update or add new
    const index = activities.findIndex(a => a.id === activity.id);
    if (index >= 0) {
      activities[index] = activity;
    } else {
      activities.push(activity);
    }
    
    // Save updated index
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: ACTIVITIES_INDEX_KEY,
      Body: JSON.stringify(activities, null, 2),
      ContentType: 'application/json',
    });
    
    await client.send(command);
  } catch (error) {
    console.error('Error saving activity to R2:', error);
    throw error;
  }
}

/**
 * Delete activity from R2
 */
export async function deleteActivityFromR2(activityId: string): Promise<void> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set up R2 environment variables.');
  }

  try {
    const client = getR2Client();
    
    // Get existing activities
    const activities = await getActivitiesFromR2({ includeDrafts: true });
    
    // Find activity
    const activity = activities.find(a => a.id === activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }
    
    // Delete image if exists
    if (activity.image && activity.image.startsWith('/api/')) {
      const imageKey = activity.image.replace('/api/admin/activities/image/', '');
      try {
        await client.send(new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: `activities/images/${imageKey}`,
        }));
      } catch (err) {
        console.error('Error deleting activity image:', err);
      }
    }
    
    // Remove from activities list
    const filtered = activities.filter(a => a.id !== activityId);
    
    // Save updated index
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: ACTIVITIES_INDEX_KEY,
      Body: JSON.stringify(filtered, null, 2),
      ContentType: 'application/json',
    });
    
    await client.send(command);
  } catch (error) {
    console.error('Error deleting activity from R2:', error);
    throw error;
  }
}

/**
 * Upload activity image to R2
 */
export async function uploadActivityImageToR2(
  activityId: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set up R2 environment variables.');
  }

  try {
    const client = getR2Client();

    // 强制使用 .jpg 后缀，因为我们在前端已经转换过了
    const filename = `${activityId}.jpg`;
    const key = `activities/images/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    });
    
    await client.send(command);
    
    // Build public URL or return API path
    const publicUrl = buildPublicR2Url(key);
    if (publicUrl) {
      return publicUrl;
    }
    
    // Fallback to API path
    return `/api/admin/activities/image/${filename}`;
  } catch (error) {
    console.error('Error uploading activity image to R2:', error);
    throw error;
  }
}

/**
 * Get activity image from R2
 */
export async function getActivityImageFromR2(filename: string): Promise<{
  body: any;
  contentType: string;
}> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured');
  }

  try {
    const client = getR2Client();

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: `activities/images/${filename}`,
    });
    
    const response = await client.send(command);
    
    return {
      body: response.Body,
      contentType: response.ContentType || 'image/jpeg',
    };
  } catch (error) {
    console.error('Error fetching activity image from R2:', error);
    throw error;
  }
}

/**
 * Delete activity image from R2
 */
export async function deleteActivityImageFromR2(filename: string): Promise<void> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set up R2 environment variables.');
  }

  try {
    const client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: `activities/images/${filename}`,
    });
    
    await client.send(command);
  } catch (error) {
    console.error('Error deleting activity image from R2:', error);
    throw error;
  }
}

