import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Retraso del fundido en ms (para escalonar). */
  delayMs?: number;
  className?: string;
}

/**
 * Fundido suave hacia arriba cuando la sección entra en pantalla.
 * Respeta prefers-reduced-motion (aparece directo, sin animar).
 */
export const Reveal: React.FC<RevealProps> = ({ children, delayMs = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${visible ? ' reveal-visible' : ''} ${className}`}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
};
