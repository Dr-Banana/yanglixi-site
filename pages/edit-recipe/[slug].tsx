import type { GetServerSideProps } from 'next';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { ACCEPTED_IMAGE_FORMATS, isValidImageFile } from '@/lib/config';
import { convertHeicToJpeg, fileToDataUrl } from '@/lib/imageUtils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getRecipeBySlugFromR2 } from '@/lib/recipe';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { v4 as uuidv4 } from 'uuid';
import Layout from '@/components/Layout';
import Link from 'next/link';
import MarkdownTextarea from '@/components/admin/components/MarkdownTextarea';

interface RecipeSections {
  introduction: string;
  ingredients: string;
  instructions: string;
  storage: string;
  servingSuggestions: string;
}

interface EditRecipeProps {
  initial?: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    cookTime?: string | null;
    difficulty?: string | null;
    servings?: string | null;
    category?: string | null;
    tags?: string[] | null;
    sections: RecipeSections;
    coverUrl?: string | null;
  } | null;
}

export default function EditRecipePage({ initial }: EditRecipeProps) {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const isNew = slug === 'new';
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [previewOn, setPreviewOn] = useState(false);
  const [sections, setSections] = useState<RecipeSections>(
    initial?.sections || {
      introduction: '',
      ingredients: '',
      instructions: '',
      storage: '',
      servingSuggestions: '',
    }
  );
  const [publish, setPublish] = useState<boolean>(false);
  const [missing, setMissing] = useState<{title?: boolean; date?: boolean; body?: boolean}>({});
  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.coverUrl || null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [displaySlug, setDisplaySlug] = useState<string>(initial?.slug || (isNew ? uuidv4() : slug || uuidv4()));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    
    // Build MDX body from sections
    const body = buildMDXFromSections(sections);
    
    const payload = {
      slug: displaySlug || undefined,
      title: String(form.get('title') || ''),
      date: String(form.get('date') || ''),
      excerpt: String(form.get('excerpt') || ''),
      cookTime: String(form.get('cookTime') || ''),
      difficulty: String(form.get('difficulty') || ''),
      servings: String(form.get('servings') || ''),
      category: String(form.get('category') || ''),
      tags: String(form.get('tags') || ''),
      body: body,
      published: publish,
    };

    if (publish) {
      const miss = {
        title: !payload.title.trim(),
        date: !payload.date.trim(),
      };
      setMissing(miss);
      if (miss.title || miss.date) {
        const missingFields = [];
        if (miss.title) missingFields.push('Title');
        if (miss.date) missingFields.push('Date');
        alert(`Please fill required fields before publishing:\n- ${missingFields.join('\n- ')}`);
        setLoading(false);
        return;
      }
    }
    const res = await fetch('/api/admin/recipes/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setMessage('Saved');
      alert('Saved successfully');
      if (data.slug) {
        setDisplaySlug(data.slug);
      }
      router.replace(`/edit-recipe/${data.slug || displaySlug}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data?.message || 'Save failed');
    }
  }

  function buildMDXFromSections(sections: RecipeSections): string {
    let mdx = '';
    
    if (sections.introduction.trim()) {
      mdx += `## Introduction\n\n${sections.introduction.trim()}\n\n`;
    }
    
    if (sections.ingredients.trim()) {
      mdx += `## Ingredients\n\n${sections.ingredients.trim()}\n\n`;
    }
    
    if (sections.instructions.trim()) {
      mdx += `## Instructions\n\n${sections.instructions.trim()}\n\n`;
    }
    
    if (sections.storage.trim()) {
      mdx += `## Storage\n\n${sections.storage.trim()}\n\n`;
    }
    
    if (sections.servingSuggestions.trim()) {
      mdx += `## Serving Suggestions\n\n${sections.servingSuggestions.trim()}\n\n`;
    }
    
    return mdx.trim();
  }

  async function onPreview() {
    setPreviewLoading(true);
    setMdxSource(null);
    try {
      const body = buildMDXFromSections(sections);
      const res = await fetch('/api/admin/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
      if (res.ok) {
        const data = await res.json();
        setMdxSource(data.mdxSource);
      } else {
        alert('Preview failed');
      }
    } finally {
      setPreviewLoading(false);
    }
  }

  async function onTogglePreview() {
    if (previewOn) {
      setPreviewOn(false);
      setMdxSource(null);
      return;
    }
    await onPreview();
    setPreviewOn(true);
  }

  useEffect(() => {
    if (!previewOn) return;
    const t = setTimeout(() => { onPreview(); }, 400);
    return () => clearTimeout(t);
  }, [previewOn, sections]);

  async function onCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size too large. Please choose an image smaller than 5MB.');
      e.target.value = '';
      return;
    }
    
    // Check file type
    if (!isValidImageFile(file)) {
      alert('Please choose a valid image file (JPEG, PNG, WebP).');
      e.target.value = '';
      return;
    }
    
    const currentSlug = displaySlug;
    if (!currentSlug) {
      alert('Please set slug first, then upload cover.');
      e.target.value = '';
      return;
    }
    
    try {
      setUploadingCover(true);
      const processedFile = await convertHeicToJpeg(file);
      const dataUrl = await fileToDataUrl(processedFile);
      
      const res = await fetch('/api/admin/recipes/cover', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ slug: currentSlug, dataUrl: dataUrl }) 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setCoverUrl(`${data.url}?ts=${Date.now()}`);
          alert('Cover uploaded successfully');
        } else {
          alert('Cover uploaded but R2_PUBLIC_HOST not configured. Image saved but may not be accessible.');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.message || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please check your connection and try again.');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  }

  async function onDeleteCover() {
    if (!coverUrl || !displaySlug) return;
    if (!confirm('Delete this cover image?')) return;
    
    setUploadingCover(true);
    try {
      const res = await fetch('/api/admin/recipes/cover-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: displaySlug }),
      });
      if (res.ok) {
        setCoverUrl(null);
        alert('Cover image deleted');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.message || 'Failed to delete cover image');
      }
    } catch (error) {
      console.error('Delete cover error:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <Layout title={`${isNew ? 'Create' : 'Edit'} Recipe - Lixi's Kitchen`} isAdmin={true}>
      <div className="bg-gradient-to-br from-primary-50 to-sage-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-serif font-bold text-neutral-800">
              {isNew ? 'Create New Recipe' : 'Edit Recipe'}
            </h1>
            <div className="flex gap-3">
              <Link 
                href="/recipes" 
                className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Recipes
              </Link>
              {!isNew && (
                <Link 
                  href={`/recipe/${displaySlug}`}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Recipe
                </Link>
              )}
            </div>
          </div>
          {message && <div className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">{message}</div>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input 
                name="title" 
                defaultValue={initial?.title || ''} 
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${missing.title ? 'border-red-500' : 'border-neutral-300'}`} 
                placeholder="Recipe name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input 
                name="date" 
                type="date" 
                defaultValue={initial?.date?.slice(0,10) || new Date().toISOString().slice(0,10)} 
                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${missing.date ? 'border-red-500' : 'border-neutral-300'}`} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Excerpt</label>
            <input 
              name="excerpt" 
              defaultValue={initial?.excerpt || ''} 
              className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              placeholder="A brief description of your recipe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Cook Time</label>
              <input 
                name="cookTime" 
                defaultValue={initial?.cookTime || ''} 
                className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="e.g. 30 mins"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty</label>
              <select 
                name="difficulty" 
                defaultValue={initial?.difficulty || ''} 
                className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Servings</label>
              <input 
                name="servings" 
                defaultValue={initial?.servings || ''} 
                className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="e.g. 4 people"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
              <input 
                name="category" 
                defaultValue={initial?.category || ''} 
                className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="e.g. Dessert, Main Course"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Tags (comma separated)</label>
              <input 
                name="tags" 
                defaultValue={(initial?.tags || []).join(', ')} 
                className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="e.g. Chinese, Spicy, Quick"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Slug (UUID)</label>
            <input 
              name="slug" 
              value={displaySlug} 
              disabled 
              className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 bg-neutral-50 text-neutral-500 cursor-not-allowed" 
              readOnly 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Cover Image</label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-full sm:w-48 h-48 sm:h-32 bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-neutral-200 flex-shrink-0 relative">
                {coverUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={onDeleteCover}
                      disabled={uploadingCover}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 disabled:opacity-50 shadow-lg"
                      title="Delete cover"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-neutral-400">No cover image</span>
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="block">
                  <input 
                    type="file" 
                    accept={ACCEPTED_IMAGE_FORMATS} 
                    onChange={onCoverSelect} 
                    disabled={uploadingCover}
                    className="hidden"
                    id="cover-upload"
                  />
                  <span className={`inline-block px-5 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${uploadingCover ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}>
                    {uploadingCover ? 'Uploading...' : 'Choose Image'}
                  </span>
                </label>
                <div className="text-xs text-neutral-500 mt-2">Will be saved as cover.jpg (max 5MB). Optional.</div>
              </div>
            </div>
          </div>

          {/* Recipe Sections */}
          <div className="space-y-6 border-t-2 border-neutral-200 pt-6">
            <h3 className="text-xl font-semibold text-neutral-800">Recipe Content</h3>
            
            {/* Introduction */}
            <MarkdownTextarea
              id="section-introduction"
              value={sections.introduction}
              onChange={(value) => setSections({...sections, introduction: value})}
              label="Introduction"
              rows={4}
              placeholder="Describe the recipe, its origin, or why you love it... (optional)"
              topOffset="80px"
            />

            {/* Ingredients */}
            <div>
              <MarkdownTextarea
                id="section-ingredients"
                value={sections.ingredients}
                onChange={(value) => setSections({...sections, ingredients: value})}
                label="Ingredients"
                rows={10}
                placeholder="- 2 cups flour&#10;- 1 cup sugar&#10;- 3 eggs&#10;... (optional)"
                topOffset="80px"
              />
              <p className="text-xs text-neutral-500 mt-1">Use bullet points (- ) or numbered lists (1. ) for ingredients</p>
            </div>

            {/* Instructions */}
            <div>
              <MarkdownTextarea
                id="section-instructions"
                value={sections.instructions}
                onChange={(value) => setSections({...sections, instructions: value})}
                label="Instructions"
                rows={12}
                placeholder="1. Preheat oven to 350°F&#10;2. Mix dry ingredients...&#10;3. Bake for 30 minutes... (optional)"
                topOffset="80px"
              />
              <p className="text-xs text-neutral-500 mt-1">Number each step clearly (1. 2. 3. ...)</p>
            </div>

            {/* Storage */}
            <MarkdownTextarea
              id="section-storage"
              value={sections.storage}
              onChange={(value) => setSections({...sections, storage: value})}
              label="Storage"
              rows={3}
              placeholder="Store in an airtight container for up to 3 days... (optional)"
              topOffset="80px"
            />

            {/* Serving Suggestions */}
            <MarkdownTextarea
              id="section-serving-suggestions"
              value={sections.servingSuggestions}
              onChange={(value) => setSections({...sections, servingSuggestions: value})}
              label="Serving Suggestions"
              rows={3}
              placeholder="Serve warm with ice cream, or enjoy with coffee... (optional)"
              topOffset="80px"
            />

            {/* Preview */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  disabled={previewLoading}
                  onClick={onTogglePreview}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${previewOn ? 'bg-neutral-900 text-white' : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'}`}
                  aria-pressed={previewOn}
                >
                  {previewLoading ? 'Rendering…' : previewOn ? '✓ Preview ON' : 'Preview OFF'}
                </button>
                {previewOn && <span className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">Live Preview</span>}
              </div>
              {previewOn && mdxSource && (
                <div className="p-6 border-2 border-primary-200 rounded-xl bg-white max-h-96 overflow-auto">
                  <div className="prose max-w-none">
                    <MDXRemote {...mdxSource} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
            <button 
              type="submit" 
              onClick={() => setPublish(false)} 
              disabled={loading} 
              className="px-6 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && !publish ? 'Saving…' : 'Save as Draft'}
            </button>
            <button 
              type="submit" 
              onClick={() => setPublish(true)} 
              disabled={loading} 
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && publish ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

function parseMDXIntoSections(content: string): RecipeSections {
  const sections: RecipeSections = {
    introduction: '',
    ingredients: '',
    instructions: '',
    storage: '',
    servingSuggestions: '',
  };

  // Split by headers - use more specific regex to avoid capturing next section
  const introMatch = content.match(/## Introduction\s*\n+([\s\S]*?)(?=\n+## Ingredients|$)/);
  const ingredientsMatch = content.match(/## Ingredients\s*\n+([\s\S]*?)(?=\n+## Instructions|$)/);
  const instructionsMatch = content.match(/## Instructions\s*\n+([\s\S]*?)(?=\n+## Storage|$)/);
  const storageMatch = content.match(/## Storage\s*\n+([\s\S]*?)(?=\n+## Serving Suggestions|$)/);
  const servingSuggestionsMatch = content.match(/## Serving Suggestions\s*\n+([\s\S]*?)$/);

  if (introMatch) sections.introduction = introMatch[1].trim();
  if (ingredientsMatch) sections.ingredients = ingredientsMatch[1].trim();
  if (instructionsMatch) sections.instructions = instructionsMatch[1].trim();
  if (storageMatch) sections.storage = storageMatch[1].trim();
  if (servingSuggestionsMatch) sections.servingSuggestions = servingSuggestionsMatch[1].trim();

  return sections;
}

export const getServerSideProps: GetServerSideProps<EditRecipeProps> = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  
  const slug = String((ctx.query as any).slug || '');
  if (slug && slug !== 'new' && process.env.R2_BUCKET) {
    const recipe = await getRecipeBySlugFromR2(slug);
    if (recipe) {
      const coverUrl = recipe.coverImage || null;
      const sections = parseMDXIntoSections(recipe.content);
      return { props: { initial: { slug, title: recipe.title, date: recipe.date, excerpt: recipe.excerpt, cookTime: recipe.cookTime || null, difficulty: recipe.difficulty || null, servings: recipe.servings || null, category: recipe.category || null, tags: recipe.tags || [], sections, coverUrl } } };
    }
  }
  return { props: { initial: null } };
};

