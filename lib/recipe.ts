import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { getR2Client, buildPublicR2Url } from './r2';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import type { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

const recipeDirectory = path.join(process.cwd(), 'recipes');
const recipeImagesDirectory = path.join(process.cwd(), 'public', 'recipe-images');

// Generate UUID for recipe if not exists
function generateOrGetUUID(slug: string, existingUUID?: string): string {
  if (existingUUID) {
    return existingUUID;
  }
  
  // Generate a deterministic UUID based on slug for consistency
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(slug).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

// Utility function to generate UUID for new recipes
export function generateRecipeUUID(slug: string): string {
  return generateOrGetUUID(slug);
}

// Get cover image path based on UUID
function getCoverImagePath(uuid: string): string | null {
  const coverImagePath = path.join(recipeImagesDirectory, `${uuid}_cover.jpg`);
  if (fs.existsSync(coverImagePath)) {
    return `/recipe-images/${uuid}_cover.jpg`;
  }
  return null;
}

export interface Recipe {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  uuid: string;
  coverImage?: string | null;
  cookTime?: string | null;
  difficulty?: string | null;
  servings?: string | null;
  category?: string | null;
  tags?: string[] | null;
  content: string;
  published?: boolean;
}

export function getRecipes(): Recipe[] {
  try {
    // Prefer R2, fallback to local files if not configured
    const bucket = process.env.R2_BUCKET;
    if (bucket) {
      return getRecipesFromR2Sync();
    }

    if (!fs.existsSync(recipeDirectory)) {
      fs.mkdirSync(recipeDirectory, { recursive: true });
      return [];
    }

    const fileNames = fs.readdirSync(recipeDirectory);
    const allRecipesData = fileNames
      .filter((fileName) => {
        const isMarkdown = fileName.endsWith('.mdx') || fileName.endsWith('.md');
        const isNotReadme = !fileName.toLowerCase().includes('readme');
        return isMarkdown && isNotReadme;
      })
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx?$/, '');
        const fullPath = path.join(recipeDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const uuid = generateOrGetUUID(slug, data.uuid);
        const coverImage = data.coverImage || getCoverImagePath(uuid);

        return {
          slug,
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          excerpt: data.excerpt || '',
          uuid,
          coverImage,
          cookTime: data.cookTime,
          difficulty: data.difficulty,
          servings: data.servings,
          category: data.category,
          tags: data.tags || [],
          content,
        } as Recipe;
      });

    return sortRecipesByDate(allRecipesData);
  } catch (error) {
    console.error('Error reading recipes:', error);
    return [];
  }
}

export function getRecipeBySlug(slug: string): Recipe | null {
  try {
    const bucket = process.env.R2_BUCKET;
    if (bucket) {
      return getRecipeBySlugFromR2Sync(slug);
    }

    const fullPath = path.join(recipeDirectory, `${slug}.mdx`);
    let fileContents: string;
    
    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, 'utf8');
    } else {
      const mdPath = path.join(recipeDirectory, `${slug}.md`);
      if (fs.existsSync(mdPath)) {
        fileContents = fs.readFileSync(mdPath, 'utf8');
      } else {
        return null;
      }
    }

    const { data, content } = matter(fileContents);

    const uuid = generateOrGetUUID(slug, data.uuid);
    const coverImage = data.coverImage || getCoverImagePath(uuid);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      uuid,
      coverImage,
      cookTime: data.cookTime,
      difficulty: data.difficulty,
      servings: data.servings,
      category: data.category,
      tags: data.tags || [],
      content,
    };
  } catch (error) {
    console.error(`Error reading recipe ${slug}:`, error);
    return null;
  }
}

export function getAllRecipeSlugs(): string[] {
  try {
    const bucket = process.env.R2_BUCKET;
    if (bucket) {
      return getAllRecipeSlugsFromR2Sync();
    }

    if (!fs.existsSync(recipeDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(recipeDirectory);
    return fileNames
      .filter((fileName) => {
        const isMarkdown = fileName.endsWith('.mdx') || fileName.endsWith('.md');
        const isNotReadme = !fileName.toLowerCase().includes('readme');
        return isMarkdown && isNotReadme;
      })
      .map((fileName) => fileName.replace(/\.mdx?$/, ''));
  } catch (error) {
    console.error('Error getting recipe slugs:', error);
    return [];
  }
}

function sortRecipesByDate(recipes: Recipe[]): Recipe[] {
  return recipes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

// ---------------- R2 helpers (sync wrappers for Next static calls) ----------------
function getRecipesFromR2Sync(): Recipe[] {
  // Sync wrapper for R2 access
  // To avoid extra dependencies, throw error and suggest using async API routes or getServerSideProps
  throw new Error('R2 access requires async. Use getRecipesFromR2 (async) via API or getServerSideProps.');
}

function getRecipeBySlugFromR2Sync(_slug: string): Recipe | null {
  throw new Error('R2 access requires async. Use getRecipeBySlugFromR2 (async) via API or getServerSideProps.');
}

function getAllRecipeSlugsFromR2Sync(): string[] {
  throw new Error('R2 access requires async. Use getAllRecipeSlugsFromR2 (async) via API or getServerSideProps.');
}

// Export async versions for API or getServerSideProps
export async function getRecipesFromR2(options?: { page?: number; pageSize?: number; includeDrafts?: boolean }): Promise<{ recipes: Recipe[]; total: number; page: number; pageSize: number; pageCount: number; }> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const prefix = 'Recipes/';

  // 1) List all post.mdx keys
  let keys: string[] = [];
  let continuationToken: string | undefined = undefined;
  do {
    const res: ListObjectsV2CommandOutput = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    }));
    const batch = (res.Contents || [])
      .map(o => o.Key!)
      .filter(k => k.endsWith('/post.mdx'));
    keys = keys.concat(batch);
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);

  // 2) Read each post.mdx, parse frontmatter, assemble Recipe (slug uses uuid)
  const recipes: Recipe[] = [];
  for (const key of keys) {
    const uuid = key.replace(/^Recipes\//, '').replace(/\/post\.mdx$/, '');
    const obj = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await streamToString(obj.Body as Readable);
    const { data, content } = matter(body);

    // Find cover: prefer frontmatter.coverImage (full URL), otherwise get cover.* or first image under images/
    let coverImage: string | null = null;
    if (data.coverImage) {
      coverImage = String(data.coverImage);
    } else {
      const imagesPrefix = `Recipes/${uuid}/images/`;
      const list: ListObjectsV2CommandOutput = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: imagesPrefix }));
      const imageKeys = (list.Contents || []).map(o => o.Key!).filter(k => /\.(png|jpe?g|webp|gif|avif)$/i.test(k));
      const coverCandidate = imageKeys.find(k => /\/cover\./i.test(k)) || imageKeys[0];
      if (coverCandidate) {
        coverImage = buildPublicR2Url(coverCandidate);
      }
    }

    // Skip drafts unless includeDrafts
    const published = Boolean(data.published);
    if (!published && !options?.includeDrafts) {
      continue;
    }

    recipes.push({
      slug: uuid,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      uuid,
      coverImage: coverImage || null,
      cookTime: data.cookTime || null,
      difficulty: data.difficulty || null,
      servings: data.servings || null,
      category: data.category || null,
      tags: data.tags || [],
      content,
      published: published,
    });
  }

  const sorted = sortRecipesByDate(recipes);
  const page = Math.max(1, options?.page || 1);
  const pageSize = Math.max(1, Math.min(50, options?.pageSize || 10));
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);
  return { recipes: paged, total, page, pageSize, pageCount };
}

export async function getRecipeBySlugFromR2(slug: string): Promise<Recipe | null> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const key = `Recipes/${slug}/post.mdx`;
  try {
    const obj = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await streamToString(obj.Body as Readable);
    const { data, content } = matter(body);

    let coverImage: string | null = null;
    if (data.coverImage) {
      coverImage = String(data.coverImage);
    } else {
      const imagesPrefix = `Recipes/${slug}/images/`;
      const list: ListObjectsV2CommandOutput = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: imagesPrefix }));
      const imageKeys = (list.Contents || []).map(o => o.Key!).filter(k => /\.(png|jpe?g|webp|gif|avif)$/i.test(k));
      const coverCandidate = imageKeys.find(k => /\/cover\./i.test(k)) || imageKeys[0];
      if (coverCandidate) {
        coverImage = buildPublicR2Url(coverCandidate);
      }
    }

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      uuid: slug,
      coverImage: coverImage || null,
      cookTime: data.cookTime || null,
      difficulty: data.difficulty || null,
      servings: data.servings || null,
      category: data.category || null,
      tags: data.tags || [],
      content,
    };
  } catch (e) {
    return null;
  }
}

export async function getAllRecipeSlugsFromR2(): Promise<string[]> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const prefix = 'Recipes/';
  const slugs: string[] = [];
  let continuationToken: string | undefined = undefined;
  do {
    const res: ListObjectsV2CommandOutput = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken, MaxKeys: 1000 }));
    const batch = (res.Contents || [])
      .map(o => o.Key!)
      .filter(k => k.endsWith('/post.mdx'))
      .map(k => k.replace(/^Recipes\//, '').replace(/\/post\.mdx$/, ''));
    slugs.push(...batch);
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
  return slugs;
}


