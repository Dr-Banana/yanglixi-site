import { useState } from 'react';
import Image from 'next/image';
import HeicImage from '@/components/HeicImage';
import Layout from '@/components/Layout';
import { holidays } from '@/components/HolidayGrid';
import { getHomeKitchenRecipesFromR2, HomeKitchenPost } from '@/lib/homeKitchen';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import Link from 'next/link';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { GetServerSideProps } from 'next';

interface HomeKitchenPostWithMDX extends HomeKitchenPost {
  descriptionMdx?: MDXRemoteSerializeResult;
}

interface HolidayPageProps {
  holiday: {
    name: string;
    icon: string;
    slug: string;
    color: string;
  };
  posts: HomeKitchenPostWithMDX[];
  isAdmin: boolean;
}

export default function HolidayPage({ holiday, posts, isAdmin }: HolidayPageProps) {
  const [filteredPosts, setFilteredPosts] = useState<HomeKitchenPostWithMDX[]>(posts);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <Layout title={`${holiday.name} - Lixi's Kitchen`} isAdmin={isAdmin}>
      {/* Header Section */}
      <div className={`bg-gradient-to-br ${holiday.color} py-16 border-b border-neutral-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors font-medium text-sm backdrop-blur-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl md:text-7xl drop-shadow-lg">
              {holiday.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg">
              {holiday.name}
            </h1>
          </div>
          <p className="text-xl text-white/90 drop-shadow">
            Family feasts and holiday memories · {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Posts Section - Social Media Style */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{holiday.icon}</div>
            <h3 className="text-2xl font-serif font-bold text-neutral-700 mb-2">
              No posts yet for {holiday.name}
            </h3>
            <p className="text-neutral-600 mb-6">
              Share your holiday feast to start the tradition!
            </p>
            {isAdmin && (
              <Link 
                href={`/admin/write-home-kitchen?holiday=${holiday.slug}`}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Share First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Create New Post Card (Admin Only) */}
            {isAdmin && (
              <Link 
                href={`/admin/write-home-kitchen?holiday=${holiday.slug}`}
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
                      Share New Feast
                    </h3>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Posts List */}
            {filteredPosts.map((post) => {
              const postDate = new Date(post.date);
              const dateStr = postDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });

              return (
                <article key={post.slug} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Post Header */}
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-serif font-bold text-neutral-800">
                            {post.title}
                          </h2>
                          {isAdmin && (
                            <>
                              {post.published !== false ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500 text-white whitespace-nowrap">
                                  ✓ PUBLIC
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-400 text-white whitespace-nowrap">
                                  DRAFT
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {dateStr}
                          </span>
                          {post.location && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {post.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="relative ml-4">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === post.slug ? null : post.slug)}
                            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            aria-label="More options"
                          >
                            <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                          {openMenuId === post.slug && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] z-20">
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
                      )}
                    </div>
                  </div>

                  {/* Post Images - Grid Layout */}
                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-1 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      post.images.length === 3 ? 'grid-cols-3' :
                      post.images.length === 4 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {post.images.slice(0, 9).map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedImage(img)}
                          className={`relative ${
                            post.images.length === 1 ? 'h-96' : 
                            post.images.length <= 4 ? 'h-64' : 
                            'h-48'
                          } bg-neutral-100 cursor-pointer hover:opacity-90 transition-opacity`}
                        >
                          <HeicImage
                            src={img}
                            alt={`${post.title} - Photo ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          {idx === 8 && post.images.length > 9 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                              <span className="text-white text-3xl font-bold">
                                +{post.images.length - 9}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-6">
                    <div className="text-neutral-700 leading-relaxed prose prose-sm max-w-none">
                      {post.descriptionMdx ? (
                        <MDXRemote {...post.descriptionMdx} />
                      ) : (
                        <p className="whitespace-pre-wrap">{post.description}</p>
                      )}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <HeicImage
              src={selectedImage}
              alt="Full size"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Check if admin session exists
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  const isAdmin = !!session;

  const slug = (ctx.params as { slug: string }).slug;
  
  // Find the holiday
  const holiday = holidays.find(h => h.slug === slug);
  if (!holiday) {
    return { notFound: true };
  }

  // Fetch home kitchen posts for this holiday
  let posts: HomeKitchenPost[] = [];
  if (process.env.R2_BUCKET) {
    const res = await getHomeKitchenRecipesFromR2({ 
      holiday: holiday.name,
      includeDrafts: isAdmin 
    });
    posts = res.recipes;
  }

  // Serialize description markdown for each post
  const postsWithMDX = await Promise.all(
    posts.map(async (post) => {
      if (post.description) {
        try {
          const descriptionMdx = await serialize(post.description);
          return { ...post, descriptionMdx };
        } catch (error) {
          console.error('Error serializing description for post:', post.slug, error);
          return post;
        }
      }
      return post;
    })
  );

  return {
    props: {
      holiday: {
        name: holiday.name,
        icon: holiday.icon,
        slug: holiday.slug,
        color: holiday.color,
      },
      posts: postsWithMDX,
      isAdmin,
    },
  };
};
