import Layout from '@/components/Layout';
import { BlogPost, getBlogPostsFromR2 } from '@/lib/blog';
import Link from 'next/link';
import { format } from 'date-fns';
import type { GetServerSideProps } from 'next';

interface BlogListProps {
  posts: BlogPost[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function BlogList({ posts, page, pageSize, pageCount, total }: BlogListProps) {
  return (
    <Layout title="Blog - Lixi's Kitchen">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-50 to-sage-50 py-8 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-2">
            Cooking Blog
          </h1>
          <p className="text-lg text-neutral-600">
            Documenting delicious food, sharing life · {total} {total === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Blog List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-serif font-bold text-neutral-700 mb-2">
              No posts yet
            </h3>
            <p className="text-neutral-600">
              Start writing your first blog post!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <article className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-primary-200 overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Cover Image - Left Side */}
                    <div className="w-full sm:w-48 md:w-56 h-48 sm:h-auto flex-shrink-0">
                      {post.coverImage ? (
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-sage-100 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-16 h-16 mx-auto text-primary-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-primary-400 font-medium">No Image</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content - Right Side */}
                    <div className="flex-1 p-6">
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-3">
                        <time dateTime={post.date} className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(post.date), 'MMMM dd, yyyy')}
                        </time>
                        
                        {post.cookTime && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {post.cookTime}
                            </span>
                          </>
                        )}
                        
                        {post.difficulty && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                              {post.difficulty}
                            </span>
                          </>
                        )}
                        
                        {post.category && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
                              {post.category}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-neutral-600 text-sm leading-relaxed mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Read More */}
                      <div className="inline-flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                        Read full post
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Pagination page={page} pageCount={pageCount} />
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const page = Number(ctx.query.page || '1') || 1;
  const pageSize = Number(ctx.query.pageSize || '10') || 10;

  let posts: BlogPost[] = [];
  let total = 0;
  let pageCount = 1;
  if (process.env.R2_BUCKET) {
    const res = await getBlogPostsFromR2({ page, pageSize });
    posts = res.posts.map(post => ({
      ...post,
      cookTime: post.cookTime || null,
      difficulty: post.difficulty || null,
      servings: post.servings || null,
      category: post.category || null,
      tags: post.tags || [],
    }));
    total = res.total;
    pageCount = res.pageCount;
  } else {
    const { getBlogPosts } = await import('@/lib/blog');
    const all = getBlogPosts();
    total = all.length;
    pageCount = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    posts = all.slice(start, start + pageSize);
  }

  return {
    props: { posts, page, pageSize, pageCount, total },
  };
};

function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const prev = page > 1 ? `/\?page=${page - 1}` : null;
  const next = page < pageCount ? `/\?page=${page + 1}` : null;
  return (
    <div className="inline-flex items-center gap-2">
      {prev ? (
        <Link href={prev} className="px-3 py-1.5 rounded border border-neutral-200 hover:border-primary-300 hover:text-primary-700">Prev</Link>
      ) : (
        <span className="px-3 py-1.5 rounded border border-neutral-100 text-neutral-300">Prev</span>
      )}
      <span className="px-3 py-1.5 text-sm text-neutral-600">Page {page} / {pageCount}</span>
      {next ? (
        <Link href={next} className="px-3 py-1.5 rounded border border-neutral-200 hover:border-primary-300 hover:text-primary-700">Next</Link>
      ) : (
        <span className="px-3 py-1.5 rounded border border-neutral-100 text-neutral-300">Next</span>
      )}
    </div>
  );
}

