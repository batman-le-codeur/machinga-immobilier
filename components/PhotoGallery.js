'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PhotoGallery({ photos, alt }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasPhotos = photos && photos.length > 0;

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + photos.length) % photos.length);
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, photos]);

  if (!hasPhotos) {
    return (
      <div className="aspect-[4/3] bg-offwhite border border-gray-200 flex items-center justify-center">
        <span className="text-sm text-gray-400">Aucune photo disponible</span>
      </div>
    );
  }

  function prev() {
    setActive((i) => (i - 1 + photos.length) % photos.length);
  }
  function next() {
    setActive((i) => (i + 1) % photos.length);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="relative block w-full aspect-[4/3] bg-offwhite border border-gray-200 overflow-hidden group"
      >
        <Image
          src={photos[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-sm">
            {active + 1} / {photos.length}
          </span>
        )}
      </button>

      {photos.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {photos.map((url, i) => (
            <button
              type="button"
              key={url}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                i === active ? 'border-primary' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image src={url} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Fermer"
            className="absolute top-5 right-5 text-white text-3xl leading-none hover:text-white/70"
          >
            &times;
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Photo précédente"
              className="absolute left-2 sm:left-6 text-white text-4xl leading-none px-3 py-2 hover:text-white/70"
            >
              &#8249;
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[active]}
            alt={alt}
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />

          {photos.length > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Photo suivante"
              className="absolute right-2 sm:right-6 text-white text-4xl leading-none px-3 py-2 hover:text-white/70"
            >
              &#8250;
            </button>
          )}

          {photos.length > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {active + 1} / {photos.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
