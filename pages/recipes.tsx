import Layout from '@/components/Layout';
import RecipeCard from '@/components/RecipeCard';
import { getRecipes, Recipe, getRecipesFromR2 } from '@/lib/recipe';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';

interface RecipesProps {
  posts: Recipe[];
  isAdmin: boolean;
}

export default function Recipes({ posts, isAdmin }: RecipesProps) {
  const [filter, setFilter] = useState<string>('all');
  
  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.category === filter);

  return (
    <Layout title="All Recipes - Lixi's Kitchen" isAdmin={isAdmin}>
      <div className="bg-gradient-to-br from-primary-50 to-sage-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-serif font-bold text-neutral-800 mb-4">
            All Recipes
          </h1>
          <p className="text-xl text-neutral-600">
            Browse through all my culinary creations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-10">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category || 'all')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    filter === category
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Create New Recipe Card - Only for Admin */}
          {isAdmin && (
            <Link 
              href="/edit-recipe/new" 
              className="recipe-card group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-dashed border-neutral-300 hover:border-primary-400 flex items-center justify-center min-h-[280px]"
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-bold text-neutral-700 group-hover:text-primary-600 transition-colors">
                  Create New Recipe
                </h3>
                <p className="text-sm text-neutral-500 mt-2">
                  Click to start creating
                </p>
              </div>
            </Link>
          )}

          {/* Existing Recipes */}
          {filteredPosts.length === 0 && !isAdmin ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-serif font-bold text-neutral-700 mb-2">
                No recipes found
              </h3>
              <p className="text-neutral-600">
                Try a different category or check back later!
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.slug} className="relative">
                {/* Draft Badge - Only visible to admin */}
                {isAdmin && post.published === false && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 px-2.5 py-1 sm:px-3 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                    DRAFT
                  </div>
                )}
                <RecipeCard
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  date={post.date}
                  coverImage={post.coverImage}
                  cookTime={post.cookTime}
                  difficulty={post.difficulty}
                  category={post.category}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Check if admin session exists
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  const isAdmin = !!session;

  let posts: Recipe[] = [];
  if (process.env.R2_BUCKET) {
    // Admin can see drafts, public users only see published
    const res = await getRecipesFromR2({ page: 1, pageSize: 1000, includeDrafts: isAdmin });
    posts = res.recipes.map(recipe => ({
      ...recipe,
      cookTime: recipe.cookTime || null,
      difficulty: recipe.difficulty || null,
      servings: recipe.servings || null,
      category: recipe.category || null,
      tags: recipe.tags || [],
      published: recipe.published,
    }));
  } else {
    posts = getRecipes().map(recipe => ({
      ...recipe,
      cookTime: recipe.cookTime || null,
      difficulty: recipe.difficulty || null,
      servings: recipe.servings || null,
      category: recipe.category || null,
      tags: recipe.tags || [],
    }));
  }

  return { props: { posts, isAdmin } };
};

