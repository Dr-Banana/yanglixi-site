import { useState, useEffect } from 'react';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export function useMDXPreview(body: string) {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [previewOn, setPreviewOn] = useState(false);

  async function onPreview() {
    setPreviewLoading(true);
    setMdxSource(null);
    try {
      const res = await fetch('/api/admin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
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

  // 自动预览（当previewOn为true且body改变时）
  useEffect(() => {
    if (!previewOn) return;
    const t = setTimeout(() => {
      onPreview();
    }, 400);
    return () => clearTimeout(t);
  }, [previewOn, body]);

  return {
    previewLoading,
    mdxSource,
    previewOn,
    onTogglePreview,
  };
}


