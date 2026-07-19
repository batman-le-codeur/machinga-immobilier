'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function PhotoUploader({ photos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec de l'envoi de la photo");
        uploaded.push(data.url);
      }
      onChange([...photos, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removePhoto(url) {
    onChange(photos.filter((p) => p !== url));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">Photos</label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square border border-gray-200">
              <Image src={url} alt="" fill sizes="25vw" className="object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs w-6 h-6 rounded-full"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && <p className="text-sm text-gray-500 mt-1">Envoi en cours…</p>}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
