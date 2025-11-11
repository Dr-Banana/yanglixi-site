import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { holidays } from '@/components/HolidayGrid';
import { getHomeKitchenRecipeBySlug, HomeKitchenPost } from '@/lib/homeKitchen';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import type { GetServerSideProps } from 'next';

interface EditPageProps {
  post: HomeKitchenPost | null;
}

export default function EditHomeKitchen({ post: initialPost }: EditPageProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialPost?.images || []);
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialPost?.images || []);

  if (!initialPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <button onClick={() => router.back()} className="text-primary-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const title = formData.get('title') as string;
    const holiday = formData.get('holiday') as string;
    const date = formData.get('date') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean);
    const published = formData.get('published') === 'on';
    
    if (!title || !holiday || !date || !description) {
      setMessage('Title, Holiday, Date, and Description are required');
      return;
    }
    
    if (uploadedImages.length === 0) {
      setMessage('Please have at least one image');
      return;
    }
    
    const post = {
      slug: initialPost.slug,
      title,
      holiday,
      description,
      location: location || null,
      images: uploadedImages,
      date: new Date(date).toISOString(),
      tags: tags.length > 0 ? tags : null,
      published,
    };

    try {
      const res = await fetch('/api/admin/home-kitchen/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      
      if (res.ok) {
        setMessage('Saved');
        alert('Saved successfully');
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.message || 'Save failed');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error saving');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Upload all files sequentially to avoid index conflicts
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          
          // Add preview immediately
          setImagePreviews(prev => [...prev, dataUrl]);
          
          try {
            // Use current index based on existing uploads
            const currentIndex = uploadedImages.length + i;
            const res = await fetch('/api/admin/home-kitchen/images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                slug: initialPost.slug, 
                imageIndex: currentIndex,
                dataUrl 
              }),
            });
            
            if (res.ok) {
              const data = await res.json();
              setUploadedImages(prev => [...prev, data.url]);
            } else {
              console.error('Failed to upload image');
            }
          } catch (error) {
            console.error(error);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Holiday Feast</h1>
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        {message && <div className="text-sm text-neutral-700 bg-neutral-100 px-4 py-2 rounded-lg">{message}</div>}
        
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Title *
              </label>
              <input 
                name="title" 
                required 
                defaultValue={initialPost.title}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Holiday *</label>
                <select 
                  name="holiday" 
                  required 
                  defaultValue={initialPost.holiday}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a holiday</option>
                  {holidays.map(h => (
                    <option key={h.id} value={h.name}>{h.icon} {h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Date *</label>
                <input 
                  type="date"
                  name="date" 
                  required
                  defaultValue={initialPost.date.split('T')[0]}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                <input 
                  name="location" 
                  defaultValue={initialPost.location || ''}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Images * <span className="text-xs text-neutral-500">(Upload more photos)</span>
              </label>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageUpload}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2"
              />
              
              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-100">
                        <Image 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea 
                name="description" 
                required 
                rows={6}
                defaultValue={initialPost.description}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags <span className="text-xs text-neutral-500">(comma separated)</span>
              </label>
              <input 
                name="tags" 
                defaultValue={initialPost.tags?.join(', ') || ''}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2" 
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="published" 
                  defaultChecked={initialPost.published !== false}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm font-medium text-neutral-700">Published</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button 
              type="submit" 
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  const slug = (ctx.params as { slug: string }).slug;
  
  let post: HomeKitchenPost | null = null;
  if (process.env.R2_BUCKET) {
    post = await getHomeKitchenRecipeBySlug(slug);
  }

  if (!post) {
    return { notFound: true };
  }
  
  return { props: { post } };
};
