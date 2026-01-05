import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { holidays } from '@/components/HolidayGrid';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import type { GetServerSideProps } from 'next';
import MarkdownTextarea from '@/components/admin/components/MarkdownTextarea';
import BatchImageUpload from '@/components/admin/components/BatchImageUpload';

export default function WriteHomeKitchen({ slug: initialSlug }: { slug?: string }) {
  const router = useRouter();
  const { holiday: holidaySlug } = router.query;
  
  const [slug, setSlug] = useState(initialSlug || '');
  const [message, setMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [description, setDescription] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  
  // Pre-select holiday if coming from holiday page
  const preselectedHoliday = holidaySlug 
    ? holidays.find(h => h.slug === holidaySlug)?.name || ''
    : '';

  // Track form changes
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleInputChange = () => {
      setHasUnsavedChanges(true);
    };

    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('input', handleInputChange);
      input.addEventListener('change', handleInputChange);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('input', handleInputChange);
        input.removeEventListener('change', handleInputChange);
      });
    };
  }, []);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

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
    
    // Validation with specific warnings
    const missingFields: string[] = [];
    if (!title.trim()) missingFields.push('Title');
    if (!holiday.trim()) missingFields.push('Holiday');
    if (!date.trim()) missingFields.push('Date');
    if (!description.trim()) missingFields.push('Description');
    
    if (missingFields.length > 0) {
      const warningMessage = `Please fill in the following required fields: ${missingFields.join(', ')}`;
      alert(warningMessage);
      setMessage(warningMessage);
      return;
    }
    
    if (uploadedImages.length === 0) {
      const warningMessage = 'Please upload at least one image';
      alert(warningMessage);
      setMessage(warningMessage);
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
        setHasUnsavedChanges(false);
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


  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Share Holiday Feast</h1>
          <button 
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        {message && <div className="text-sm text-neutral-700 bg-neutral-100 px-4 py-2 rounded-lg">{message}</div>}
        
        <form ref={formRef} onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
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

            {slug ? (
              <BatchImageUpload
                slug={slug}
                imagePreviews={imagePreviews}
                uploadedImages={uploadedImages}
                onImagesChange={setUploadedImages}
                onPreviewsChange={setImagePreviews}
                onUnsavedChanges={() => setHasUnsavedChanges(true)}
                uploadApiEndpoint="/api/admin/home-kitchen/images"
                label="Images"
                required
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Images * <span className="text-xs text-neutral-500">(Please set a title first)</span>
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center bg-neutral-50">
                  <p className="text-sm text-neutral-500">Please enter a title above to enable image upload</p>
                </div>
              </div>
            )}

            <MarkdownTextarea
              id="description-field-write"
              value={description}
              onChange={(value) => {
                setDescription(value);
                setHasUnsavedChanges(true);
              }}
              label="Description *"
              rows={6}
              required
            />
            <input type="hidden" name="description" value={description} />

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
