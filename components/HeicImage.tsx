import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { convertHeicToJpeg } from '@/lib/imageUtils';

interface HeicImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export default function HeicImage({ src, alt, ...props }: HeicImageProps) {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversionStarted = useRef<string | null>(null);
  
  const isHeic = src.toLowerCase().split('?')[0].endsWith('.heic') || 
                 src.toLowerCase().split('?')[0].endsWith('.heif') ||
                 src.toLowerCase().split('?')[0].endsWith('.octet-stream');

  useEffect(() => {
    if (isHeic) {
      if (conversionStarted.current === src) {
        return; // Already converting this src
      }
      handleHeicConversion();
    } else {
      setDisplaySrc(src);
      setError(null);
    }

    return () => {
      if (displaySrc.startsWith('blob:')) {
        URL.revokeObjectURL(displaySrc);
      }
    };
  }, [src]);

  const handleHeicConversion = async () => {
    conversionStarted.current = src;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer]); // 先获取原始二进制
      
      // 检查是否已经是 JPEG 了
      const responseType = response.headers.get('Content-Type');
      if (responseType === 'image/jpeg' || responseType === 'image/png') {
        setDisplaySrc(src);
        return;
      }

      const convertedBlob = await convertHeicToJpeg(blob); 
      
      // 如果转换出的结果和输入一样（说明转换跳过了或失败了）
      if (convertedBlob === blob) {
        setDisplaySrc(src);
      } else {
        const objectUrl = URL.createObjectURL(convertedBlob);
        setDisplaySrc(objectUrl);
      }
    } catch (err: any) {
      console.error('HEIC processing error:', err);
      setDisplaySrc(src); // 报错也回退到原图，至少不留白
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    // 成功加载
  };

  const handleImageError = () => {
    // 转换失败且浏览器也不认识时，显示一个轻量级的错误提示
    setError('Format not supported in this browser');
  };

  if (isHeic && isLoading) {
    return (
      <div className={`bg-neutral-100 flex items-center justify-center ${props.className || ''}`} style={{ ...props.style, minHeight: props.fill ? '100%' : '200px', width: props.fill ? '100%' : 'auto' }}>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-pulse text-xs text-neutral-400">Optimizing HEIC...</div>
        </div>
      </div>
    );
  }

  // 渲染逻辑
  const renderImage = () => {
    if (displaySrc.startsWith('blob:')) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img 
          src={displaySrc} 
          alt={alt} 
          className={props.className}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={props.fill ? {
            position: 'absolute',
            height: '100%',
            width: '100%',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            objectFit: 'cover',
            ...props.style
          } : props.style}
        />
      );
    }

    return (
      <Image 
        {...props}
        src={displaySrc} 
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        unoptimized={isHeic} // 如果是 HEIC 原图，必须开启 unoptimized 否则 Next.js 会报错
      />
    );
  };

  return (
    <div className="relative w-full h-full min-h-[inherit]">
      {renderImage()}
      {error && !isLoading && !displaySrc.startsWith('blob:') && (
        <div className="absolute inset-0 bg-neutral-50 flex items-center justify-center p-2 text-center">
          <span className="text-[10px] text-neutral-400 leading-tight">
            HEIC format not supported by your browser.<br/>
            Try Safari or update your post.
          </span>
        </div>
      )}
    </div>
  );
}

