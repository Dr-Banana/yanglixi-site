import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';

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
    // Create blog directory if it doesn't exist
    if (!fs.existsSync(blogDirectory)) {
      fs.mkdirSync(blogDirectory, { recursive: true });
      return [];
    }

    const fileNames = fs.readdirSync(blogDirectory);
    const allPostsData = fileNames
      .filter((fileName) => {
        // Filter out README files and only include .mdx or .md files
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

    // Sort posts by date
    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
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

