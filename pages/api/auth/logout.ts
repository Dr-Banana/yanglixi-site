import type { NextApiRequest, NextApiResponse } from 'next';
import { buildLogoutCookie } from '@/lib/auth';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', buildLogoutCookie());
  res.status(302).setHeader('Location', '/admin/login');
  res.end();
}


