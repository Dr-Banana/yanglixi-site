import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { deleteHomeKitchenRecipeFromR2 } from '@/lib/homeKitchen';

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

    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    // Delete from R2
    await deleteHomeKitchenRecipeFromR2(slug);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error deleting home kitchen recipe:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

