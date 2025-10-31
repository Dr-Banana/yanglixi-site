import type { NextApiRequest, NextApiResponse } from 'next';
import { buildAuthCookie, createSessionToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { username, password } = req.body || {};
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    return res.status(500).json({ message: 'Admin is not configured' });
  }
  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = await createSessionToken({ username });
  res.setHeader('Set-Cookie', buildAuthCookie(token));
  return res.status(200).json({ ok: true });
}


