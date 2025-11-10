import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface RecipeCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string | null;
  cookTime?: string | null;
  difficulty?: string | null;
  category?: string | null;
  editMode?: boolean;
}

export default function RecipeCard({
  slug,
  title,
  excerpt,
  date,
  coverImage,
  cookTime,
  difficulty,
  category,
  editMode = false,
}: RecipeCardProps) {
  // Always link to view page, edit button will be on the recipe detail page
  const href = `/recipe/${slug}`;
  
  return (
    <Link href={href} className="recipe-card group">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
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

      {/* Content */}
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

