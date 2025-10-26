import Link from 'next/link';
import { format } from 'date-fns';

interface RecipeCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cookTime?: string | null;
  difficulty?: string | null;
  category?: string | null;
}

export default function RecipeCard({
  slug,
  title,
  excerpt,
  date,
  cookTime,
  difficulty,
  category,
}: RecipeCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="recipe-card group">
      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-3 flex-wrap">
          <time dateTime={date}>
            {format(new Date(date), 'MMM dd, yyyy')}
          </time>
          {cookTime && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {cookTime}
              </span>
            </>
          )}
          {difficulty && (
            <>
              <span>•</span>
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                {difficulty}
              </span>
            </>
          )}
          {category && (
            <>
              <span>•</span>
              <span className="px-2 py-0.5 bg-sage-100 text-sage-700 rounded text-xs font-medium">
                {category}
              </span>
            </>
          )}
        </div>
        
        <h3 className="text-xl font-serif font-bold text-neutral-800 mb-3 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-neutral-600 line-clamp-3 mb-4">
          {excerpt}
        </p>
        
        <div className="inline-flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
          Read Recipe
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

