import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { getR2Client, buildPublicR2Url } from './r2';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import type { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

const blogDirectory = path.join(process.cwd(), 'blog');
const blogImagesDirectory = path.join(process.cwd(), 'public', 'blog-images');

// Generate UUID for blog post if not exists
function generateOrGetUUID(slug: string, existingUUID?: string): string {
  if (existingUUID) {
    return existingUUID;
  }
  
  // Generate a deterministic UUID based on slug for consistency
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(slug).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

// Utility function to generate UUID for new blog posts
export function generateBlogUUID(slug: string): string {
  return generateOrGetUUID(slug);
}

// Get cover image path based on UUID
function getCoverImagePath(uuid: string): string | null {
  const coverImagePath = path.join(blogImagesDirectory, `${uuid}_cover.jpg`);
  if (fs.existsSync(coverImagePath)) {
    return `/blog-images/${uuid}_cover.jpg`;
  }
  return null;
}

export interface BlogPost {
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
}

export function getBlogPosts(): BlogPost[] {
  try {
    // 优先从 R2 读取，如果未配置则回退到本地文件
    const bucket = process.env.R2_BUCKET;
    if (bucket) {
      return getBlogPostsFromR2Sync();
    }

    if (!fs.existsSync(blogDirectory)) {
      fs.mkdirSync(blogDirectory, { recursive: true });
      return [];
    }

    const fileNames = fs.readdirSync(blogDirectory);
    const allPostsData = fileNames
      .filter((fileName) => {
        const isMarkdown = fileName.endsWith('.mdx') || fileName.endsWith('.md');
        const isNotReadme = !fileName.toLowerCase().includes('readme');
        return isMarkdown && isNotReadme;
      })
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx?$/, '');
        const fullPath = path.join(blogDirectory, fileName);
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
        } as BlogPost;
      });

    return sortPostsByDate(allPostsData);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const bucket = process.env.R2_BUCKET;
    if (bucket) {
      return getBlogPostBySlugFromR2Sync(slug);
    }

    const fullPath = path.join(blogDirectory, `${slug}.mdx`);
    let fileContents: string;
    
    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, 'utf8');
    } else {
      const mdPath = path.join(blogDirectory, `${slug}.md`);
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
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getAllSlugs(): string[] {
  try {
    const bucket = process.env.R2_BUCKET;
    if (bucket) {
      return getAllSlugsFromR2Sync();
    }

    if (!fs.existsSync(blogDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(blogDirectory);
    return fileNames
      .filter((fileName) => {
        const isMarkdown = fileName.endsWith('.mdx') || fileName.endsWith('.md');
        const isNotReadme = !fileName.toLowerCase().includes('readme');
        return isMarkdown && isNotReadme;
      })
      .map((fileName) => fileName.replace(/\.mdx?$/, ''));
  } catch (error) {
    console.error('Error getting slugs:', error);
    return [];
  }
}

function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
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
function getBlogPostsFromR2Sync(): BlogPost[] {
  // 同步包装：阻塞式等待 Promise 结果（通过 deasync 风格简化）
  // 为避免引入额外依赖，这里直接抛错提示改用异步 API 路由或 getServerSideProps
  throw new Error('R2 access requires async. Use getBlogPostsFromR2 (async) via API or getServerSideProps.');
}

function getBlogPostBySlugFromR2Sync(_slug: string): BlogPost | null {
  throw new Error('R2 access requires async. Use getBlogPostBySlugFromR2 (async) via API or getServerSideProps.');
}

function getAllSlugsFromR2Sync(): string[] {
  throw new Error('R2 access requires async. Use getAllSlugsFromR2 (async) via API or getServerSideProps.');
}

// 导出异步版本供 API 或 GSSP 使用
export async function getBlogPostsFromR2(options?: { page?: number; pageSize?: number }): Promise<{ posts: BlogPost[]; total: number; page: number; pageSize: number; pageCount: number; }> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const prefix = 'Blogs/';

  // 1) 列出所有 post.mdx 键
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

  // 2) 读取每个 post.mdx，解析 frontmatter，组装 BlogPost（slug 使用 uuid）
  const posts: BlogPost[] = [];
  for (const key of keys) {
    const uuid = key.replace(/^Blogs\//, '').replace(/\/post\.mdx$/, '');
    const obj = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await streamToString(obj.Body as Readable);
    const { data, content } = matter(body);

    // 查找封面：优先 frontmatter.coverImage（完整 URL），否则取 images/ 下 cover.* 或第一个图片
    let coverImage: string | null = null;
    if (data.coverImage) {
      coverImage = String(data.coverImage);
    } else {
      const imagesPrefix = `Blogs/${uuid}/images/`;
      const list: ListObjectsV2CommandOutput = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: imagesPrefix }));
      const imageKeys = (list.Contents || []).map(o => o.Key!).filter(k => /\.(png|jpe?g|webp|gif|avif)$/i.test(k));
      const coverCandidate = imageKeys.find(k => /\/cover\./i.test(k)) || imageKeys[0];
      if (coverCandidate) {
        coverImage = buildPublicR2Url(coverCandidate);
      }
    }

    posts.push({
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
    });
  }

  const sorted = sortPostsByDate(posts);
  const page = Math.max(1, options?.page || 1);
  const pageSize = Math.max(1, Math.min(50, options?.pageSize || 10));
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);
  return { posts: paged, total, page, pageSize, pageCount };
}

export async function getBlogPostBySlugFromR2(slug: string): Promise<BlogPost | null> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const key = `Blogs/${slug}/post.mdx`;
  try {
    const obj = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await streamToString(obj.Body as Readable);
    const { data, content } = matter(body);

    let coverImage: string | null = null;
    if (data.coverImage) {
      coverImage = String(data.coverImage);
    } else {
      const imagesPrefix = `Blogs/${slug}/images/`;
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

export async function getAllSlugsFromR2(): Promise<string[]> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const prefix = 'Blogs/';
  const slugs: string[] = [];
  let continuationToken: string | undefined = undefined;
  do {
    const res: ListObjectsV2CommandOutput = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken, MaxKeys: 1000 }));
    const batch = (res.Contents || [])
      .map(o => o.Key!)
      .filter(k => k.endsWith('/post.mdx'))
      .map(k => k.replace(/^Blogs\//, '').replace(/\/post\.mdx$/, ''));
    slugs.push(...batch);
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
  return slugs;
}

