'use client';

import { useState } from 'react';
import Image from 'next/image';

const MAX_DIMENSION = 1600; // px, cote le plus long
const JPEG_QUALITY = 0.82;

// Redimensionne et recompresse la photo dans le navigateur avant l'envoi :
// une photo de telephone de 5-8 Mo descend a quelques centaines de Ko, sans
// perte visible a l'ecran. En cas d'echec, le fichier original est envoye.
async function compressImage(file) {
  if (!file.type.startsWith('image/')) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 500 * 1024) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // fond blanc pour les PNG transparents
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

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
        formData.append('file', await compressImage(file));
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

  // La premiere photo sert de couverture dans les resultats de recherche.
  function makeCover(url) {
    onChange([url, ...photos.filter((p) => p !== url)]);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">Photos</label>
      {photos.length > 1 && (
        <p className="text-xs text-gray-500 mb-2">
          La photo « Principale » s&apos;affiche en premier dans les résultats de recherche.
        </p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square border border-gray-200">
              <Image src={url} alt="" fill sizes="25vw" className="object-cover" />
              {url === photos[0] ? (
                <span className="absolute bottom-1 left-1 bg-secondary text-white text-[11px] px-1.5 py-0.5">
                  Principale
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  className="absolute bottom-1 left-1 bg-white/90 text-ink text-[11px] px-1.5 py-0.5 hover:bg-white"
                >
                  Mettre en principale
                </button>
              )}
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
