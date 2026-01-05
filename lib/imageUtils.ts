/**
 * Converts a HEIC file to a JPEG blob.
 * Returns the original file if it's not a HEIC file or if conversion fails.
 */
export async function convertHeicToJpeg(file: File | Blob): Promise<Blob | File> {
  if (typeof window === 'undefined') return file;

  // 1. Safari 原生支持检测
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    return file;
  }

  // 2. 转换逻辑
  try {
    const heic2any = (await import('heic2any')).default;
    
    // 强制转换为标准的 image/heic 类型
    let blobToConvert = file;
    if (!(file instanceof File) || file.type === 'application/octet-stream' || !file.type) {
      blobToConvert = new Blob([file], { type: 'image/heic' });
    }

    const result = await heic2any({
      blob: blobToConvert,
      toType: 'image/jpeg',
      quality: 0.7
    });
    
    return Array.isArray(result) ? result[0] : result;
  } catch (error: any) {
    // 如果还是失败，尝试开启 multiple 模式
    try {
      const heic2any = (await import('heic2any')).default;
      const result = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        multiple: true
      });
      return Array.isArray(result) ? result[0] : result;
    } catch (e) {
      // 彻底失败
    }
    
    console.error('HEIC conversion failed:', error);
    return file;
  }
}

/**
 * Converts a file or blob to a Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

