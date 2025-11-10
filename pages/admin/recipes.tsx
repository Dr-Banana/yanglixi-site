import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { getRecipesFromR2 } from '@/lib/recipe';
import { useState } from 'react';

interface Props {
  recipes: Array<{ slug: string; title: string; date: string }>;
}

export default function AdminRecipes({ recipes }: Props) {
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/recipes/delete?slug=${encodeURIComponent(toDelete)}`, { method: 'POST' });
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
          <h1 className="text-2xl font-bold">Recipes</h1>
          <div className="flex gap-2">
            <Link href="/admin" className="px-3 py-2 rounded border">Admin Home</Link>
            <Link href="/admin/write-recipe" className="px-3 py-2 rounded bg-neutral-900 text-white">New Recipe</Link>
            <button onClick={() => { window.location.href = '/api/auth/logout'; }} className="px-3 py-2 rounded border">Logout</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow divide-y">
          {recipes.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No recipes found. Create your first recipe!
            </div>
          ) : (
            recipes.map(r => (
              <div key={r.slug} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-neutral-500">{r.slug} · {new Date(r.date).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/write-recipe?slug=${encodeURIComponent(r.slug)}`} className="px-3 py-1.5 border rounded">Edit</Link>
                  <button onClick={() => setToDelete(r.slug)} className="px-3 py-1.5 border rounded text-red-600">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Confirm Delete Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">Delete recipe?</h2>
            <p className="text-sm text-neutral-600 mb-4">This will permanently delete this recipe and its images from R2. This action cannot be undone.</p>
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

  // Redirect to main recipes page
  return { redirect: { destination: '/recipes', permanent: false } };
};

