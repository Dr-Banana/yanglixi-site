import Layout from '@/components/Layout';
import RecipeCard from '@/components/RecipeCard';
import { getBlogPosts, BlogPost } from '@/lib/blog';
import { useState } from 'react';

interface RecipesProps {
  posts: BlogPost[];
}

export default function Recipes({ posts }: RecipesProps) {
  const [filter, setFilter] = useState<string>('all');
  
  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.category === filter);

  return (
    <Layout title="All Recipes - Lixi's Kitchen">
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
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-serif font-bold text-neutral-700 mb-2">
              No recipes found
            </h3>
            <p className="text-neutral-600">
              Try a different category or check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <RecipeCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                cookTime={post.cookTime}
                difficulty={post.difficulty}
                category={post.category}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = getBlogPosts().map(post => ({
    ...post,
    cookTime: post.cookTime || null,
    difficulty: post.difficulty || null,
    servings: post.servings || null,
    category: post.category || null,
    tags: post.tags || [],
  }));

  return {
    props: {
      posts,
    },
  };
}

