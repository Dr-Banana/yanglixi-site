import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { holidays } from '@/components/HolidayGrid';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import type { GetServerSideProps } from 'next';

export default function WriteHomeKitchen({ slug: initialSlug }: { slug?: string }) {
  const router = useRouter();
  const { holiday: holidaySlug } = router.query;
  
  const [slug, setSlug] = useState(initialSlug || '');
  const [message, setMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Pre-select holiday if coming from holiday page
  const preselectedHoliday = holidaySlug 
    ? holidays.find(h => h.slug === holidaySlug)?.name || ''
    : '';

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
      setMessage('Please upload at least one image');
      return;
    }
    
    const newSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const post = {
      slug: newSlug,
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
        if (!slug) {
          setSlug(newSlug);
          router.replace(`/admin/write-home-kitchen?slug=${newSlug}&holiday=${holidaySlug || ''}`);
        }
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
    
    if (!slug) {
      alert('Please set a title first to generate a slug');
      return;
    }

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
                slug, 
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
          <h1 className="text-2xl font-bold">Share Holiday Feast</h1>
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
                Title * <span className="text-xs text-neutral-500">(e.g., "Christmas Dinner 2024")</span>
              </label>
              <input 
                name="title" 
                required 
                onBlur={(e) => {
                  if (!slug && e.target.value) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                  }
                }}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="Give your holiday feast a title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Holiday *</label>
                <select 
                  name="holiday" 
                  required 
                  defaultValue={preselectedHoliday}
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
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                <input 
                  name="location" 
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2" 
                  placeholder="e.g., Los Angeles, CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Images * <span className="text-xs text-neutral-500">(Upload multiple photos)</span>
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
                Description * <span className="text-xs text-neutral-500">(What did you eat? Brief intro to each dish)</span>
              </label>
              <textarea 
                name="description" 
                required 
                rows={6} 
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="Share what you ate for this holiday... Describe the dishes, flavors, and memories."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags <span className="text-xs text-neutral-500">(comma separated)</span>
              </label>
              <input 
                name="tags" 
                className="w-full border border-neutral-300 rounded-lg px-4 py-2" 
                placeholder="e.g., family, turkey, traditional"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="published" 
                  defaultChecked 
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm font-medium text-neutral-700">Published</span>
              </label>
              <p className="text-xs text-neutral-500 mt-1 ml-6">
                Uncheck to save as draft
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button 
              type="submit" 
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Share Post
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

  const slug = (ctx.query.slug as string) || '';
  
  return { props: { slug } };
};
