import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { getBlogPostsFromR2 } from '@/lib/blog';
import { useState } from 'react';

interface Props {
  posts: Array<{ slug: string; title: string; date: string }>;
}

export default function AdminPosts({ posts }: Props) {
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/posts/delete?slug=${encodeURIComponent(toDelete)}`, { method: 'POST' });
    setDeleting(false);
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.message || 'Delete failed');
      setToDelete(null);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Posts</h1>
          <Link href="/admin/write" className="px-3 py-2 rounded bg-neutral-900 text-white">New Post</Link>
        </div>
        <div className="bg-white rounded-xl shadow divide-y">
          {posts.map(p => (
            <div key={p.slug} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-neutral-500">{p.slug} · {new Date(p.date).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/write?slug=${encodeURIComponent(p.slug)}`} className="px-3 py-1.5 border rounded">Edit</Link>
                <button onClick={() => setToDelete(p.slug)} className="px-3 py-1.5 border rounded text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Confirm Delete Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">Delete post?</h2>
            <p className="text-sm text-neutral-600 mb-4">This will permanently delete this post and its images from R2. This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setToDelete(null)} className="px-3 py-1.5 border rounded">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
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

  const res = await getBlogPostsFromR2({ page: 1, pageSize: 1000, includeDrafts: true });
  const posts = res.posts.map(p => ({ slug: p.slug, title: p.title, date: p.date }));
  return { props: { posts } };
};


