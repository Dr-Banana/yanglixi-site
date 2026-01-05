import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { getR2Client } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import matter from 'gray-matter';

function getTokenFromReq(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  return token || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const token = getTokenFromReq(req);
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const bucket = process.env.R2_BUCKET!;
  const { slug, title, date, excerpt, cookTime, difficulty, servings, category, tags, body, published } = req.body || {};
  if (published) {
    if (!title || !date) return res.status(400).json({ message: 'Missing required fields' });
  }

  const uuid = slug && String(slug).trim() ? String(slug).trim() : cryptoRandom();
  const key = `Recipes/${uuid}/post.mdx`;

  const tagsArray = typeof tags === 'string' && tags.trim().length
    ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : undefined;

  const front: Record<string, any> = {};
  if (title) front.title = title;
  if (date) front.date = date;
  if (typeof excerpt === 'string') front.excerpt = excerpt;
  if (cookTime) front.cookTime = cookTime;
  if (difficulty) front.difficulty = difficulty;
  if (servings) front.servings = servings;
  if (category) front.category = category;
  if (tagsArray) front.tags = tagsArray;
  if (typeof published === 'boolean') front.published = published;

  const fm = matter.stringify(body || '', front);

  const client = getR2Client();
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: fm, ContentType: 'text/markdown; charset=utf-8' }));

  return res.status(200).json({ ok: true, slug: uuid });
}

function cryptoRandom(): string {
  // 32 hex chars
  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`;
}

