import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { uploadHomeKitchenImage } from '@/lib/homeKitchen';

// Configure API route to accept larger payloads (for images)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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

    const { slug, imageIndex, dataUrl } = req.body;

    if (!slug || imageIndex === undefined || !dataUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // dataUrl: data:image/jpeg;base64,XXXX
    const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid dataUrl' });
    }

    const contentType = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    // Upload to R2
    const url = await uploadHomeKitchenImage(slug, imageIndex, buffer, contentType);

    return res.status(200).json({ ok: true, url });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

