import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselMediaProps {
  images: string[];
  alt: string;
  fit: string;
  position: string;
  zoom: number;
  imgClassName?: string;
  intervalSec?: number;
  onOpenZoom?: () => void;
  /** Clic en una foto (recibe el índice). Si se define, reemplaza onOpenZoom. */
  onSlideClick?: (index: number) => void;
}

/** Galería rotativa con crossfade suave, avance automático, flechas, puntos y swipe. Pausa al hover. */
export const CarouselMedia: React.FC<CarouselMediaProps> = ({
  images,
  alt,
  fit,
  position,
  zoom,
  imgClassName = '',
  intervalSec = 6,
  onOpenZoom,
  onSlideClick,
}) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);

  const count = images.length;
  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduced || count <= 1) return;
    const ms = Math.min(Math.max(intervalSec, 3), 120) * 1000;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, ms);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, count, intervalSec]);

  if (count === 0) return null;

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
      }}
    >
      {fit === 'contain' && (
        <img
          src={images[index % count]}
          alt=""
          aria-hidden
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 pointer-events-none"
        />
      )}
      {/* Stack con crossfade: la activa se funde sobre la anterior. */}
      <div
        className="absolute inset-0"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {images.map((src, i) => (
          <img
            key={`${i}-${src.slice(-24)}`}
            src={src}
            alt={i === 0 ? alt : ''}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            draggable={false}
            onClick={onSlideClick ? () => onSlideClick(i) : onOpenZoom}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-out ${imgClassName} ${
              // El zoom cinematográfico solo en modo cubrir: en modo completo
              // la imagen debe verse 100% sin recortes.
              i === index ? `opacity-100 z-10${fit === 'cover' ? ' carousel-kenburns' : ''}` : 'opacity-0 z-0'
            } ${onSlideClick || onOpenZoom ? 'cursor-pointer' : ''}`}
            style={{ objectFit: fit as any, objectPosition: position }}
          />
        ))}
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(index - 1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(index + 1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); go(i); }}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                title={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
