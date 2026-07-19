'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxBg({ src, className = '', strength = 0.25 }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function update() {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const offset = rect.top * strength;
      node.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [strength]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={ref}
        className={`absolute inset-0 will-change-transform ${className}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
}
