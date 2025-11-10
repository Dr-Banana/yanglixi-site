import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySessionToken, getCookieName } from '@/lib/auth';
import { deleteActivityFromR2 } from '@/lib/activity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin session
    const cookie = req.headers.cookie || '';
    const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { activityId } = req.body;

    if (!activityId) {
      return res.status(400).json({ error: 'Activity ID is required' });
    }

    // Delete from R2
    await deleteActivityFromR2(activityId);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

