'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const COLLAPSED_HEIGHT = 288; // px, environ 12 lignes

// Description d'annonce lisible : paragraphes respectes, largeur de lecture
// limitee, et texte long replie derriere "Lire la suite".
export default function ListingDescription({ text }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) setOverflowing(ref.current.scrollHeight > COLLAPSED_HEIGHT + 48);
  }, [text]);

  const paragraphs = String(text)
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const collapsed = overflowing && !expanded;

  return (
    <div>
      <div
        ref={ref}
        className="relative overflow-hidden transition-[max-height] duration-500"
        style={{ maxHeight: collapsed ? COLLAPSED_HEIGHT : ref.current?.scrollHeight || 'none' }}
      >
        <div className="max-w-[68ch] space-y-4 text-[15px] leading-7 text-gray-700 break-words">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
        {collapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-white/0" />
        )}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? 'Réduire' : 'Lire la suite'}
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            fill="none"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
