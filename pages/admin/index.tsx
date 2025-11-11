import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';

export default function AdminHome() {
  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={() => { window.location.href = '/api/auth/logout'; }} className="px-4 py-2 rounded border">Logout</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blog Management */}
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h2 className="text-2xl font-serif font-bold">Blog Posts</h2>
            </div>
            <p className="text-neutral-600 mb-6">Manage blog post content, stored in Blogs/ path</p>
            <div className="flex gap-3">
              <Link href="/admin/posts" className="px-4 py-2 rounded border hover:bg-neutral-50 transition-colors">
                View All Posts
              </Link>
              <Link href="/admin/write" className="px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                Write New Post
              </Link>
            </div>
          </div>

          {/* Recipe Management */}
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-2xl font-serif font-bold">Recipes</h2>
            </div>
            <p className="text-neutral-600 mb-6">Manage recipe content, stored in Recipes/ path</p>
            <div className="flex gap-3">
              <Link href="/admin/recipes" className="px-4 py-2 rounded border hover:bg-neutral-50 transition-colors">
                View All Recipes
              </Link>
              <Link href="/admin/write-recipe" className="px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                Write New Recipe
              </Link>
            </div>
          </div>

          {/* Activities Management */}
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-serif font-bold">Activities</h2>
            </div>
            <p className="text-neutral-600 mb-6">Manage activity carousel content on homepage</p>
            <div className="flex gap-3">
              <Link href="/admin/activities" className="px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                Manage Activities
              </Link>
            </div>
          </div>

          {/* Home Kitchen Management */}
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
              </svg>
              <h2 className="text-2xl font-serif font-bold">Home Kitchen</h2>
            </div>
            <p className="text-neutral-600 mb-6">Manage holiday feast posts, stored in HomeKitchen/ path</p>
            <div className="flex gap-3">
              <Link href="/admin/home-kitchen" className="px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                Manage Posts
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Note</h3>
              <p className="text-sm text-blue-800">
                Blog and Recipe are now completely separate systems, stored in R2 under Blogs/ and Recipes/ paths respectively.
              </p>
            </div>
          </div>
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
  // Redirect to home page
  return { redirect: { destination: '/', permanent: false } };
};


