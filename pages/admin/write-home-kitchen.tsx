import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { holidays } from '@/components/HolidayGrid';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import { ACCEPTED_IMAGE_FORMATS, isValidImageFile } from '@/lib/config';
import { convertHeicToJpeg, fileToDataUrl } from '@/lib/imageUtils';
import type { GetServerSideProps } from 'next';

export default function WriteHomeKitchen({ slug: initialSlug }: { slug?: string }) {
  const router = useRouter();
  const { holiday: holidaySlug } = router.query;
  
  const [slug, setSlug] = useState(initialSlug || '');
  const [message, setMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    
    // Check file types (support HEIC/HEIF formats)
    const invalidFiles = fileArray.filter(file => !isValidImageFile(file));
    
    if (invalidFiles.length > 0) {
      alert('Please choose image files only.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    if (!slug) {
      alert('Please set a title first to generate a slug');
      return;
    }

    setUploading(true);
    const uploadPromises: Promise<void>[] = [];

    // Upload all files in parallel for better performance
    fileArray.forEach((file, i) => {
      const uploadPromise = (async () => {
        const fileIndex = uploadedImages.length + i;
        
        try {
          // Update progress: converting
          setUploadProgress(prev => ({ ...prev, [fileIndex]: 10 }));
          
          // 1. 转换 HEIC 到 JPEG (如果是 HEIC 的话)
          const processedFile = await convertHeicToJpeg(file);
          
          setUploadProgress(prev => ({ ...prev, [fileIndex]: 30 }));
          
          // 2. 将文件转换为 Data URL
          const dataUrl = await fileToDataUrl(processedFile);
          
          setUploadProgress(prev => ({ ...prev, [fileIndex]: 50 }));
          
          // 3. 核心修复：强制修改 Data URL 的 MIME 类型头为 image/jpeg
          const jpegDataUrl = dataUrl.replace(/^data:.*;base64,/, 'data:image/jpeg;base64,');
          
          // Add preview immediately
          setImagePreviews(prev => [...prev, jpegDataUrl]);
          
          setUploadProgress(prev => ({ ...prev, [fileIndex]: 70 }));
          
          // Use current index based on existing uploads
          const res = await fetch('/api/admin/home-kitchen/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              slug, 
              imageIndex: fileIndex,
              dataUrl: jpegDataUrl // 这里发送的是 JPEG 数据
            }),
          });
          
          setUploadProgress(prev => ({ ...prev, [fileIndex]: 90 }));
          
          if (res.ok) {
            const data = await res.json();
            // 后端返回的 URL 应该是 .jpg 结尾的
            setUploadedImages(prev => [...prev, data.url]);
            setHasUnsavedChanges(true);
            setUploadProgress(prev => ({ ...prev, [fileIndex]: 100 }));
          } else {
            console.error('Failed to upload image');
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileIndex];
              return newProgress;
            });
            // Remove preview if upload failed
            setImagePreviews(prev => prev.filter((_, idx) => idx !== uploadedImages.length + i));
          }
        } catch (error) {
          console.error('Error processing or uploading image:', error);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileIndex];
            return newProgress;
          });
          // Remove preview if upload failed
          setImagePreviews(prev => prev.filter((_, idx) => idx !== uploadedImages.length + i));
        }
      })();
      
      uploadPromises.push(uploadPromise);
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    
    setUploading(false);
    setUploadProgress({});
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Images * <span className="text-xs text-neutral-500">(Upload multiple photos at once)</span>
              </label>
              
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  uploading 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept={ACCEPTED_IMAGE_FORMATS} 
                  multiple
                  onChange={handleFileInputChange}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload-input"
                />
                <label 
                  htmlFor="image-upload-input"
                  className={`cursor-pointer flex flex-col items-center gap-3 ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {uploading ? 'Please wait while images are being processed' : 'Supports HEIC, JPEG, PNG (multiple files allowed)'}
                    </p>
                  </div>
                </label>
                
                {uploading && Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(uploadProgress).map(([index, progress]) => (
                      <div key={index} className="w-full">
                        <div className="flex justify-between text-xs text-neutral-600 mb-1">
                          <span>Image {parseInt(index) + 1}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => {
                    const isUploading = uploadProgress[uploadedImages.length + index] !== undefined;
                    const progress = uploadProgress[uploadedImages.length + index];
                    
                    return (
                      <div key={index} className="relative group">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-100">
                          <Image 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            fill 
                            className="object-cover" 
                          />
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                <span className="text-white text-xs">{progress}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isUploading}
                          className={`absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 transition-opacity ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
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
