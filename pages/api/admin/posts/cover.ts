import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { getR2Client } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

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

  const { slug, dataUrl } = req.body || {};
  if (!slug || !dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ message: 'Missing slug or dataUrl' });
  }

  // dataUrl: data:image/jpeg;base64,XXXX
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) return res.status(400).json({ message: 'Invalid dataUrl' });
  const contentType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');

  const client = getR2Client();
  const bucket = process.env.R2_BUCKET!;
  const key = `Blogs/${slug}/images/cover.jpg`;

  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));

  return res.status(200).json({ ok: true });
}


