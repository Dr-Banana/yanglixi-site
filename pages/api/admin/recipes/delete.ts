import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { getR2Client } from '@/lib/r2';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

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

  const slug = String(req.query.slug || '');
  if (!slug) return res.status(400).json({ message: 'Missing slug' });

  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const prefix = `Recipes/${slug}/`;

  // list objects under folder
  const listed = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  const keys = (listed.Contents || []).map(o => ({ Key: o.Key! }));
  if (keys.length) {
    await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys } }));
  }

  return res.status(200).json({ ok: true });
}

