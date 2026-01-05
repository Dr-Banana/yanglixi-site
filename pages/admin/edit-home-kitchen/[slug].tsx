import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { holidays } from '@/components/HolidayGrid';
import { getHomeKitchenRecipeBySlug, HomeKitchenPost } from '@/lib/homeKitchen';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { ACCEPTED_IMAGE_FORMATS, isValidImageFile } from '@/lib/config';
import { convertHeicToJpeg, fileToDataUrl } from '@/lib/imageUtils';
import type { GetServerSideProps } from 'next';
import MarkdownTextarea from '@/components/admin/components/MarkdownTextarea';

interface EditPageProps {
  post: HomeKitchenPost | null;
}

export default function EditHomeKitchen({ post: initialPost }: EditPageProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialPost?.images || []);
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialPost?.images || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [description, setDescription] = useState(initialPost?.description || '');
  const formRef = useRef<HTMLFormElement>(null);
  const initialImagesRef = useRef<string[]>(initialPost?.images || []);

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

  // Track image changes
  useEffect(() => {
    const imagesChanged = JSON.stringify(uploadedImages) !== JSON.stringify(initialImagesRef.current);
    if (imagesChanged) {
      setHasUnsavedChanges(true);
    }
  }, [uploadedImages]);

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
    
    if (!title.trim() || !holiday.trim() || !date.trim() || !description.trim()) {
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
        setHasUnsavedChanges(false);
        initialImagesRef.current = uploadedImages;
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

    // Check file types (support HEIC/HEIF formats)
    const invalidFiles = files.filter(file => !isValidImageFile(file));
    
    if (invalidFiles.length > 0) {
      alert('Please choose image files only.');
      e.target.value = '';
      return;
    }

    // Upload all files sequentially to avoid index conflicts
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // 1. 转换 HEIC 到 JPEG (如果是 HEIC 的话)
        const processedFile = await convertHeicToJpeg(file);
        
        // 2. 将文件转换为 Data URL
        const dataUrl = await fileToDataUrl(processedFile);
        
        // 3. 核心修复：强制修改 Data URL 的 MIME 类型头为 image/jpeg
        const jpegDataUrl = dataUrl.replace(/^data:.*;base64,/, 'data:image/jpeg;base64,');
        
        // Add preview immediately
        setImagePreviews(prev => [...prev, jpegDataUrl]);
        
        // Use current index based on existing uploads
        const currentIndex = uploadedImages.length + i;
        const res = await fetch('/api/admin/home-kitchen/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            slug: initialPost.slug, 
            imageIndex: currentIndex,
            dataUrl: jpegDataUrl // 这里发送的是 JPEG 数据
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          // 后端返回的 URL 应该是 .jpg 结尾的
          setUploadedImages(prev => [...prev, data.url]);
          setHasUnsavedChanges(true);
        } else {
          console.error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error processing or uploading image:', error);
      }
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Holiday Feast</h1>
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
                accept={ACCEPTED_IMAGE_FORMATS} 
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

            <MarkdownTextarea
              id="description-field-edit"
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
