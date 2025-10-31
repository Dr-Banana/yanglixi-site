import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';

export default function AdminHome() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { redirect: { destination: '/admin/posts', permanent: false } };
};


