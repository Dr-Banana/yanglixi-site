import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { getHomeKitchenRecipesFromR2, HomeKitchenPost } from '@/lib/homeKitchen';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { holidays } from '@/components/HolidayGrid';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';

interface HomeKitchenManageProps {
  posts: HomeKitchenPost[];
  isAdmin: boolean;
}

export default function ManageHomeKitchen({ posts, isAdmin }: HomeKitchenManageProps) {
  const router = useRouter();
  const [filteredPosts, setFilteredPosts] = useState<HomeKitchenPost[]>(posts);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch('/api/admin/home-kitchen/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (response.ok) {
        setFilteredPosts(filteredPosts.filter(p => p.slug !== slug));
        alert('Post deleted successfully');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  // Group posts by year
  const grouped: { [year: string]: HomeKitchenPost[] } = {};
  filteredPosts.forEach(post => {
    const year = new Date(post.date).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(post);
  });
  
  const years = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <Layout title="Manage Home Kitchen Posts" isAdmin={isAdmin}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Home Kitchen Posts</h1>
            <p className="text-neutral-600">All holiday feast posts across all holidays</p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-serif font-bold text-neutral-700 mb-2">
              No posts yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Create your first holiday feast post from any holiday page
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add New Post Card */}
            <Link 
              href="/admin/write-home-kitchen"
              className="block"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-dashed border-neutral-300 hover:border-primary-400 flex items-center justify-center min-h-[150px] cursor-pointer group">
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-700 group-hover:text-primary-600 transition-colors">
                    Add New Post
                  </h3>
                </div>
              </div>
            </Link>

            {years.map(year => (
              <div key={year}>
                {/* Year Header */}
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">{year}</h2>
                
                {/* Posts in this year */}
                <div className="space-y-4">
                  {grouped[year].map((post) => {
                    const postDate = new Date(post.date);
                    const month = postDate.toLocaleDateString('en-US', { month: 'short' });
                    const day = postDate.getDate();
                    
                    // Find holiday info for color and emoji
                    const holidayInfo = holidays.find(h => h.name === post.holiday);
                    
                    return (
                      <div key={post.slug} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-neutral-100">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left: Date & Location */}
                          <div className="md:w-32 flex-shrink-0">
                            <div className="text-xl font-semibold text-neutral-800 mb-3">
                              <span className="text-2xl">{day}</span> {month}.
                            </div>
                            {post.location && (
                              <div className="text-sm text-neutral-600 flex items-start gap-1">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="line-clamp-2">{post.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Middle: First Image (or placeholder) */}
                          <div className="relative w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                            {post.images && post.images.length > 0 ? (
                              <>
                                <Image 
                                  src={post.images[0]} 
                                  alt={post.title} 
                                  fill 
                                  className="object-cover" 
                                />
                                {post.images.length > 1 && (
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    +{post.images.length - 1}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                                No Images
                              </div>
                            )}
                          </div>

                          {/* Right: Title, Description & Actions */}
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-neutral-800 line-clamp-1">
                                    {post.title}
                                  </h3>
                                  {/* Holiday Badge with emoji and gradient */}
                                  {holidayInfo ? (
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${holidayInfo.color} text-white whitespace-nowrap flex-shrink-0 shadow-sm`}>
                                      {holidayInfo.icon} {holidayInfo.name}
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-200 text-neutral-700 whitespace-nowrap flex-shrink-0">
                                      {post.holiday}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {post.published !== false ? (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
                                      ✓ PUBLIC
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-400 text-white">
                                      DRAFT
                                    </span>
                                  )}
                                  {post.tags && post.tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {post.tags.slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="text-xs text-neutral-500">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Three-dot menu */}
                              <div className="relative ml-2">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === post.slug ? null : post.slug)}
                                  className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                                  aria-label="More options"
                                >
                                  <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                  </svg>
                                </button>
                                {openMenuId === post.slug && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[120px] z-20">
                                      <Link
                                        href={`/admin/edit-home-kitchen/${post.slug}`}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                                        onClick={() => setOpenMenuId(null)}
                                      >
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>Edit</span>
                                      </Link>
                                      <button
                                        onClick={() => {
                                          handleDelete(post.slug);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="text-neutral-600 text-sm leading-relaxed line-clamp-2">
                              {post.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  const isAdmin = true;
  let posts: HomeKitchenPost[] = [];

  if (process.env.R2_BUCKET) {
    const res = await getHomeKitchenRecipesFromR2({ 
      includeDrafts: true  // Show all posts including drafts
    });
    posts = res.recipes;
  }

  return {
    props: {
      posts,
      isAdmin,
    },
  };
};

