import { useState } from 'react';
import { ACCEPTED_IMAGE_FORMATS, isValidImageFile } from '@/lib/config';
import { convertHeicToJpeg, fileToDataUrl } from '@/lib/imageUtils';

interface UseCoverUploadOptions {
  slug: string;
  coverApiEndpoint: string;
  coverDeleteApiEndpoint: string;
  initialCoverUrl?: string | null;
}

export function useCoverUpload({
  slug,
  coverApiEndpoint,
  coverDeleteApiEndpoint,
  initialCoverUrl = null,
}: UseCoverUploadOptions) {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl);
  const [uploadingCover, setUploadingCover] = useState(false);

  async function onCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
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

    if (!slug) {
      alert('Please set slug first, then upload cover.');
      e.target.value = '';
      return;
    }

    try {
      setUploadingCover(true);
      const processedFile = await convertHeicToJpeg(file);
      const dataUrl = await fileToDataUrl(processedFile);
      
      const res = await fetch(coverApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, dataUrl: dataUrl }),
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
    if (!coverUrl || !slug) return;
    if (!confirm('Delete this cover image?')) return;

    setUploadingCover(true);
    try {
      const res = await fetch(coverDeleteApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
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

  return {
    coverUrl,
    uploadingCover,
    onCoverSelect,
    onDeleteCover,
    setCoverUrl, // 允许外部更新（例如从initial值初始化）
  };
}


