import Layout from '@/components/Layout';
import { getRecipeBySlug, getRecipeBySlugFromR2 } from '@/lib/recipe';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { format } from 'date-fns';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';

interface RecipePostProps {
  recipe: {
    slug: string;
    title: string;
    date: string;
    cookTime?: string | null;
    difficulty?: string | null;
    servings?: string | null;
    category?: string | null;
    tags?: string[] | null;
  };
  mdxSource: MDXRemoteSerializeResult;
  isAdmin: boolean;
}

const components = {};

export default function RecipePost({ recipe, mdxSource, isAdmin }: RecipePostProps) {
  return (
    <Layout title={`${recipe.title} - Lixi's Kitchen`} description={recipe.title} isAdmin={isAdmin}>
      <article>
        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button and Edit Button */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/recipes" 
              className="inline-flex items-center text-neutral-600 hover:text-primary-600 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Recipes
            </Link>
            
            {isAdmin && (
              <Link 
                href={`/edit-recipe/${recipe.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Recipe
              </Link>
            )}
          </div>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-800 mb-6">
              {recipe.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-neutral-600 mb-8">
              <time dateTime={recipe.date} className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(recipe.date), 'MMMM dd, yyyy')}
              </time>
              
              {recipe.cookTime && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.cookTime}
                </span>
              )}
              
              {recipe.difficulty && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {recipe.difficulty}
                </span>
              )}
              
              {recipe.servings && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {recipe.servings}
                </span>
              )}
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
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
              <Link href="/recipes" className="btn-primary">
                ← Back to Recipes
              </Link>
            </div>
          </footer>
        </div>
      </article>
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
  const recipe = process.env.R2_BUCKET
    ? await getRecipeBySlugFromR2(slug)
    : getRecipeBySlug(slug);

  if (!recipe) {
    return { notFound: true };
  }

  const mdxSource = await serialize(recipe.content);

  return {
    props: {
      recipe: {
        slug: slug,
        title: recipe.title,
        date: recipe.date,
        cookTime: recipe.cookTime || null,
        difficulty: recipe.difficulty || null,
        servings: recipe.servings || null,
        category: recipe.category || null,
        tags: recipe.tags || [],
      },
      mdxSource,
      isAdmin,
    },
  };
};

