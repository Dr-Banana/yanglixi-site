import { useState, useRef } from 'react';
import Image from 'next/image';
import { ACCEPTED_IMAGE_FORMATS, isValidImageFile } from '@/lib/config';
import { convertHeicToJpeg, fileToDataUrl } from '@/lib/imageUtils';

interface BatchImageUploadProps {
  slug: string;
  imagePreviews: string[];
  uploadedImages: string[];
  onImagesChange: (images: string[]) => void;
  onPreviewsChange: (previews: string[]) => void;
  onUnsavedChanges?: () => void;
  uploadApiEndpoint: string;
  label?: string;
  required?: boolean;
}

export default function BatchImageUpload({
  slug,
  imagePreviews,
  uploadedImages,
  onImagesChange,
  onPreviewsChange,
  onUnsavedChanges,
  uploadApiEndpoint,
  label = 'Images',
  required = false,
}: BatchImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          onPreviewsChange([...imagePreviews, jpegDataUrl]);
          
          setUploadProgress(prev => ({ ...prev, [fileIndex]: 70 }));
          
          // Use current index based on existing uploads
          const res = await fetch(uploadApiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              slug, 
              imageIndex: fileIndex,
              dataUrl: jpegDataUrl
            }),
          });
          
          setUploadProgress(prev => ({ ...prev, [fileIndex]: 90 }));
          
          if (res.ok) {
            const data = await res.json();
            // 后端返回的 URL 应该是 .jpg 结尾的
            const newUploadedImages = [...uploadedImages, data.url];
            onImagesChange(newUploadedImages);
            // 更新预览为实际URL，替换dataUrl
            const newPreviews = [...imagePreviews];
            newPreviews[uploadedImages.length + i] = data.url;
            onPreviewsChange(newPreviews);
            onUnsavedChanges?.();
            setUploadProgress(prev => ({ ...prev, [fileIndex]: 100 }));
          } else {
            console.error('Failed to upload image');
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileIndex];
              return newProgress;
            });
            // Remove preview if upload failed
            onPreviewsChange(imagePreviews.filter((_, idx) => idx !== uploadedImages.length + i));
          }
        } catch (error) {
          console.error('Error processing or uploading image:', error);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileIndex];
            return newProgress;
          });
          // Remove preview if upload failed
          onPreviewsChange(imagePreviews.filter((_, idx) => idx !== uploadedImages.length + i));
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
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = uploadedImages.filter((_, i) => i !== index);
    onPreviewsChange(newPreviews);
    onImagesChange(newImages);
    onUnsavedChanges?.();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label} {required && '*'}{' '}
        <span className="text-xs text-neutral-500">(Upload multiple photos at once)</span>
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
          id={`image-upload-input-${slug}`}
        />
        <label 
          htmlFor={`image-upload-input-${slug}`}
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
  );
}

