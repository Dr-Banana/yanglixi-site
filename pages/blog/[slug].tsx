import Layout from '@/components/Layout';
import { getBlogPostBySlug, getAllSlugs } from '@/lib/blog';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { format } from 'date-fns';
import Link from 'next/link';

interface BlogPostProps {
  post: {
    title: string;
    date: string;
    cookTime?: string | null;
    difficulty?: string | null;
    servings?: string | null;
    category?: string | null;
    tags?: string[] | null;
  };
  mdxSource: MDXRemoteSerializeResult;
}

const components = {};

export default function BlogPost({ post, mdxSource }: BlogPostProps) {
  return (
    <Layout title={`${post.title} - Lixi's Kitchen`} description={post.title}>
      <article>
        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-neutral-600 hover:text-primary-600 transition-colors font-medium text-sm mb-8"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog List
          </Link>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-neutral-600 mb-8">
              <time dateTime={post.date} className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(post.date), 'MMMM dd, yyyy')}
              </time>
              
              {post.cookTime && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {post.cookTime}
                </span>
              )}
              
              {post.difficulty && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {post.difficulty}
                </span>
              )}
              
              {post.servings && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {post.servings}
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Body */}
          <div className="blog-content">
            <MDXRemote {...mdxSource} components={components} />
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-neutral-200">
            <div className="flex justify-center">
              <Link href="/" className="btn-primary">
                ← Back to Blog List
              </Link>
            </div>
          </footer>
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const slugs = getAllSlugs();
  
  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      notFound: true,
    };
  }

  const mdxSource = await serialize(post.content);

  return {
    props: {
      post: {
        title: post.title,
        date: post.date,
        cookTime: post.cookTime || null,
        difficulty: post.difficulty || null,
        servings: post.servings || null,
        category: post.category || null,
        tags: post.tags || [],
      },
      mdxSource,
    },
  };
}

