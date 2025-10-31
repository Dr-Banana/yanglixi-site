import type { GetServerSideProps } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getBlogPostBySlugFromR2 } from '@/lib/blog';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

interface WriteProps {
  initial?: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    cookTime?: string | null;
    difficulty?: string | null;
    servings?: string | null;
    category?: string | null;
    tags?: string[] | null;
    body: string;
    coverUrl?: string | null;
  } | null;
}

export default function WritePage({ initial }: WriteProps) {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [previewOn, setPreviewOn] = useState(false);
  const [body, setBody] = useState<string>(initial?.body || '');
  const [publish, setPublish] = useState<boolean>(false);
  const [missing, setMissing] = useState<{title?: boolean; date?: boolean; body?: boolean}>({});
  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.coverUrl || null);
  const [uploadingCover, setUploadingCover] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      slug: (form.get('slug') as string) || undefined,
      title: String(form.get('title') || ''),
      date: String(form.get('date') || ''),
      excerpt: String(form.get('excerpt') || ''),
      cookTime: String(form.get('cookTime') || ''),
      difficulty: String(form.get('difficulty') || ''),
      servings: String(form.get('servings') || ''),
      category: String(form.get('category') || ''),
      tags: String(form.get('tags') || ''),
      body: String(form.get('body') || ''),
      published: publish,
    };

    if (publish) {
      const miss = {
        title: !payload.title,
        date: !payload.date,
        body: !payload.body,
      };
      setMissing(miss);
      if (miss.title || miss.date || miss.body) {
        alert('Please fill required fields before publishing');
        setLoading(false);
        return;
      }
    }
    const res = await fetch('/api/admin/posts/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setMessage('Saved');
      alert('Saved successfully');
      router.replace(`/admin/write?slug=${encodeURIComponent(data.slug)}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data?.message || 'Save failed');
    }
  }

  async function onPreview() {
    setPreviewLoading(true);
    setMdxSource(null);
    try {
      const res = await fetch('/api/admin/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
      if (res.ok) {
        const data = await res.json();
        setMdxSource(data.mdxSource);
      } else {
        alert('Preview failed');
      }
    } finally {
      setPreviewLoading(false);
    }
  }

  async function onTogglePreview() {
    if (previewOn) {
      setPreviewOn(false);
      setMdxSource(null);
      return;
    }
    await onPreview();
    setPreviewOn(true);
  }

  useEffect(() => {
    if (!previewOn) return;
    const t = setTimeout(() => { onPreview(); }, 400);
    return () => clearTimeout(t);
  }, [previewOn, body]);

  async function onCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentSlug = (document.querySelector('input[name="slug"]') as HTMLInputElement | null)?.value || initial?.slug || slug || '';
    if (!currentSlug) {
      alert('Please set slug first, then upload cover.');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setUploadingCover(true);
    try {
      const res = await fetch('/api/admin/posts/cover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: currentSlug, dataUrl }) });
      if (res.ok) {
        // Recompute cover URL from env
        const host = (process.env as any).NEXT_PUBLIC_R2_PUBLIC_HOST || (process.env as any).R2_PUBLIC_HOST || '';
        const base = typeof host === 'string' ? host.replace(/\/$/, '') : '';
        if (base) setCoverUrl(`${base}/Blogs/${currentSlug}/images/cover.jpg?ts=${Date.now()}`);
        alert('Cover uploaded');
      } else {
        alert('Upload failed');
      }
    } finally {
      setUploadingCover(false);
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{slug ? 'Edit Post' : 'New Post'}</h1>
          <button onClick={() => router.push('/admin/posts')} className="text-sm px-3 py-1.5 border rounded">Back to Posts</button>
        </div>
        {message && <div className="text-sm text-neutral-700">{message}</div>}
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Title</label>
              <input name="title" defaultValue={initial?.title || ''} className={`w-full border rounded px-3 py-2 ${missing.title ? 'border-red-500' : ''}`} />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Date</label>
              <input name="date" type="date" defaultValue={initial?.date?.slice(0,10) || ''} className={`w-full border rounded px-3 py-2 ${missing.date ? 'border-red-500' : ''}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Excerpt</label>
            <input name="excerpt" defaultValue={initial?.excerpt || ''} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Cook Time</label>
              <input name="cookTime" defaultValue={initial?.cookTime || ''} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Difficulty</label>
              <input name="difficulty" defaultValue={initial?.difficulty || ''} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Servings</label>
              <input name="servings" defaultValue={initial?.servings || ''} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Category</label>
              <input name="category" defaultValue={initial?.category || ''} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Tags (comma separated)</label>
            <input name="tags" defaultValue={(initial?.tags || []).join(', ')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Slug (optional, defaults to UUID)</label>
            <input name="slug" defaultValue={initial?.slug || slug || ''} className="w-full border rounded px-3 py-2" />
          </div>
          
          <div>
            <label className="block text-sm text-neutral-600 mb-2">Cover Image (cover.jpg)</label>
            <div className="flex items-start gap-4">
              <div className="w-40 h-28 bg-neutral-100 rounded overflow-hidden flex items-center justify-center border">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-neutral-500">No cover</span>
                )}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={onCoverSelect} />
                <div className="text-xs text-neutral-500 mt-1">Will be saved to images/cover.jpg</div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Body (MDX)</label>
            <textarea name="body" id="body" rows={20} value={body} onChange={(e) => setBody(e.target.value)} className={`w-full rounded px-3 py-2 font-mono text-sm border ${missing.body ? 'border-red-500' : (previewOn ? 'border-primary-400 ring-1 ring-primary-200' : 'border-neutral-200')}`} />
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={previewLoading}
                onClick={onTogglePreview}
                className={`px-3 py-1.5 rounded transition-colors ${previewOn ? 'bg-neutral-900 text-white' : 'border'}`}
                aria-pressed={previewOn}
              >
                {previewLoading ? 'Rendering…' : previewOn ? 'Preview: ON' : 'Preview: OFF'}
              </button>
              {previewOn && <span className="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700">Preview mode</span>}
            </div>
            {previewOn && mdxSource && (
              <div className="mt-4 p-4 border-2 border-primary-200 rounded bg-neutral-50 h-80 overflow-auto">
                <div className="prose max-w-none">
                  <MDXRemote {...mdxSource} />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" onClick={() => setPublish(false)} disabled={loading} className="px-4 py-2 rounded border">
              {loading && !publish ? 'Saving…' : 'Save (draft)'}
            </button>
            <button type="submit" onClick={() => setPublish(true)} disabled={loading} className="px-4 py-2 rounded bg-neutral-900 text-white">
              {loading && publish ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<WriteProps> = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const slug = String((ctx.query as any).slug || '');
  if (slug && process.env.R2_BUCKET) {
    const post = await getBlogPostBySlugFromR2(slug);
    if (post) {
      // derive cover url if exists
      const coverUrl = post.coverImage || null;
      return { props: { initial: { slug, title: post.title, date: post.date, excerpt: post.excerpt, cookTime: post.cookTime || null, difficulty: post.difficulty || null, servings: post.servings || null, category: post.category || null, tags: post.tags || [], body: post.content, coverUrl } } };
    }
  }
  return { props: { initial: null } };
};


