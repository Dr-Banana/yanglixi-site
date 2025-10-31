import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';

export default function AdminHome() {
  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin</h1>
        <div className="flex gap-3">
          <Link href="/admin/posts" className="px-4 py-2 rounded bg-neutral-900 text-white">Manage Posts</Link>
          <button onClick={() => { window.location.href = '/api/auth/logout'; }} className="px-4 py-2 rounded border">Logout</button>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
};


