import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySessionToken, getCookieName } from '@/lib/auth';
import { uploadActivityImageToR2, getActivityImageFromR2 } from '@/lib/activity';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Retrieve image
  if (req.method === 'GET') {
    try {
      const { filename } = req.query;
      
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ error: 'Filename is required' });
      }

      const { body, contentType } = await getActivityImageFromR2(filename);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      
      const chunks = [];
      for await (const chunk of body) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      return res.send(buffer);
    } catch (error: any) {
      console.error('Error fetching activity image:', error);
      return res.status(404).json({ error: 'Image not found' });
    }
  }

  // POST - Upload image
  if (req.method === 'POST') {
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

      const { activityId, image, contentType } = req.body;

      if (!activityId || !image) {
        return res.status(400).json({ error: 'Activity ID and image are required' });
      }

      // Convert base64 to buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to R2
      const imageUrl = await uploadActivityImageToR2(activityId, buffer, contentType || 'image/jpeg');

      return res.status(200).json({ success: true, imageUrl });
    } catch (error: any) {
      console.error('Error uploading activity image:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

