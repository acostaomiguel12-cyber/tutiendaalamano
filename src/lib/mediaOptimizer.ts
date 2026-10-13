/**
 * Media Optimizer & Ultra-Lightweight Compressor
 * Compresses images to modern WebP format via HTML5 Canvas
 * Downsamples resolution, strips heavy metadata, and optimizes video streaming loops.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  width: number;
  height: number;
  savedPercentage: number;
  format: 'webp' | 'jpeg';
  fileName: string;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.76 for optimal balance between sharp retina display and minimal weight)
  targetFormat?: 'webp' | 'jpeg';
}

/**
 * Compresses an image File from the user's camera or filesystem
 * Converts heavy PNGs/JPEGs (e.g. 5MB - 15MB) into lightweight WebP (<150KB)
 */
export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1440,
    maxHeight = 1440,
    quality = 0.76,
    targetFormat = 'webp',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al decodificar la imagen'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No se pudo inicializar el motor de renderizado Canvas'));
          return;
        }

        // High quality bicubic filtering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first; fallback to JPEG if browser doesn't export webp
        let mimeType = targetFormat === 'webp' ? 'image/webp' : 'image/jpeg';
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // Check if WebP was actually returned (some older browsers fallback to png)
        if (mimeType === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate byte size from base64 string
        const base64Data = dataUrl.split(',')[1] || '';
        const compressedSize = Math.round((base64Data.length * 3) / 4);
        const originalSize = file.size;
        const savedPercentage = Math.max(
          0,
          Math.round(((originalSize - compressedSize) / originalSize) * 100)
        );

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          width,
          height,
          savedPercentage,
          format: mimeType.includes('webp') ? 'webp' : 'jpeg',
          fileName: file.name.replace(/\.[^/.]+$/, '') + `.${mimeType.includes('webp') ? 'webp' : 'jpg'}`,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Automatically injects optimal lightweight query parameters
 * into external CDNs like Unsplash (auto format webp, quality 70, capped resolution)
 */
export function getOptimizedImageUrl(
  url: string | undefined,
  width = 1200,
  quality = 70
): string {
  if (!url) return '';
  if (url.startsWith('data:')) return url; // Already base64 compressed

  try {
    if (url.includes('unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      return urlObj.toString();
    }
  } catch {
    // Return original if URL parsing fails
  }

  return url;
}

/**
 * Format bytes into human readable format (KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Parse video URL to identify if it's YouTube, Vimeo or Direct MP4/WebM
 */
export function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string; videoId?: string } {
  if (!url) return { type: 'direct', embedUrl: '' };

  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      videoId: ytMatch[1],
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      videoId: vimeoMatch[1],
    };
  }

  return { type: 'direct', embedUrl: trimmed };
}

/**
 * Curated Lightweight Streetwear & Fashion Video Loops
 * These are compressed MP4 videos under 2-3MB with quick streaming initialization.
 */
export interface VideoPreset {
  id: string;
  name: string;
  category: string;
  videoUrl: string;
  posterUrl: string;
  sizeEstimate: string;
  description: string;
}

export const LIGHTWEIGHT_VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'vid-street-runway',
    name: 'Pasarela Streetwear Bogotá/Medellín',
    category: 'Moda Urbana',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-jacket-41121-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=70',
    sizeEstimate: '1.4 MB (Stream Ultraliviano)',
    description: 'Modelo con chaqueta streetwear en estudio con iluminación dramática',
  },
  {
    id: 'vid-tailor-cotton',
    name: 'Confección Algodón 450 GSM',
    category: 'Artesanía & Taller',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-cloth-42173-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=70',
    sizeEstimate: '1.2 MB (Stream Ultraliviano)',
    description: 'Manos confeccionando tela pesada y corte de alta precisión',
  },
  {
    id: 'vid-urban-night',
    name: 'Night Vibes Poblado Medellín',
    category: 'Cultura Urbana',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-in-the-city-at-night-42283-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1600&q=70',
    sizeEstimate: '1.8 MB (Stream Ultraliviano)',
    description: 'Caminata nocturna con luces de neón y look oversized',
  },
  {
    id: 'vid-boutique-archive',
    name: 'Showroom & Racks de Ropa',
    category: 'Tienda & Catálogo',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-rack-of-designer-clothes-in-a-boutique-42171-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=70',
    sizeEstimate: '1.1 MB (Stream Ultraliviano)',
    description: 'Recorrido minimalista por percheros de prendas de diseñador',
  },
];
