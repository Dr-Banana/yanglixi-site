import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { serialize } from 'next-mdx-remote/serialize';

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

  const { body } = req.body || {};
  if (typeof body !== 'string') return res.status(400).json({ message: 'Missing body' });

  const mdxSource = await serialize(body);
  return res.status(200).json({ mdxSource });
}


