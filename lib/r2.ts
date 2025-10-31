import { S3Client } from '@aws-sdk/client-s3';

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 configuration. Please set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.');
  }

  cachedClient = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  return cachedClient;
}

export function buildPublicR2Url(key: string): string | null {
  const publicHost = process.env.R2_PUBLIC_HOST;
  const bucket = process.env.R2_BUCKET;
  if (!publicHost || !bucket) return null;
  const host = publicHost.replace(/\/$/, '');
  // 假设自定义域名已绑定到桶根目录
  return `${host}/${encodeURI(key)}`;
}


