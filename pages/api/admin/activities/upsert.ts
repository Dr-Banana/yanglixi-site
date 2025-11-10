import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySessionToken, getCookieName } from '@/lib/auth';
import { saveActivityToR2, Activity } from '@/lib/activity';

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

    const activity: Activity = req.body;

    // Validate required fields
    if (!activity.id || !activity.title || !activity.description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to R2
    await saveActivityToR2(activity);

    return res.status(200).json({ success: true, activity });
  } catch (error: any) {
    console.error('Error saving activity:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

