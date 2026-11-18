'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export const MAX_PHOTOS = 15;
const MAX_DIMENSION = 1600; // px, cote le plus long
const JPEG_QUALITY = 0.82;
const MAX_UPLOAD = 8 * 1024 * 1024; // limite du serveur
const SERVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PARALLEL = 2;

class PhotoError extends Error {}

function looksLikeHeic(file) {
  return /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

// Prepare la photo dans le navigateur : redimensionnee et recompressee en JPEG
// (une photo de telephone de 5-8 Mo descend a quelques centaines de Ko). Toute
// image que le navigateur sait lire est convertie, quel que soit son format
// d'origine, ce qui evite les refus de format.
async function preparePhoto(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Illisible par le navigateur : on n'envoie l'original que s'il est dans un
    // format accepte par le serveur.
    if (SERVER_TYPES.includes(file.type) && file.size <= MAX_UPLOAD) return file;
    if (looksLikeHeic(file)) {
      throw new PhotoError(
        "Format HEIC non lu par ce navigateur. Réglez l'appareil photo sur JPEG (« Le plus compatible » sur iPhone) ou envoyez une capture d'écran de la photo."
      );
    }
    throw new PhotoError("Ce fichier n'est pas une photo lisible. Choisissez une autre image.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && SERVER_TYPES.includes(file.type) && file.size < 500 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // fond blanc pour les PNG transparents
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) {
    if (SERVER_TYPES.includes(file.type) && file.size <= MAX_UPLOAD) return file;
    throw new PhotoError("Impossible de préparer cette photo. Choisissez une autre image.");
  }
  if (SERVER_TYPES.includes(file.type) && file.size <= blob.size) return file;
  return new File([blob], (file.name || 'photo').replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

async function uploadOnce(file) {
  const formData = new FormData();
  formData.append('file', file);
  let res;
  try {
    res = await fetch('/api/upload', { method: 'POST', body: formData });
  } catch {
    throw new Error('Connexion interrompue pendant l’envoi.');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new PhotoError('Votre session a expiré. Reconnectez-vous puis réessayez.');
  if (!res.ok) throw new PhotoError(data.error || "L'envoi de la photo a échoué.");
  return data.url;
}

let nextId = 0;

// Ajout de photos : grande zone a toucher (galerie ou appareil photo), glisser-
// deposer sur ordinateur, envoi photo par photo avec apercu immediat. Une photo
// en echec n'empeche pas les autres et peut etre renvoyee.
// onBusyChange(true|false) : informe le formulaire qu'un envoi est en cours.
export default function PhotoUploader({ photos, onChange, onBusyChange }) {
  const [pending, setPending] = useState([]); // { id, file, preview, status: 'envoi' | 'erreur', error }
  const [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const inputId = useRef(`photos-${Math.random().toString(36).slice(2)}`).current;

  const busy = pending.some((p) => p.status === 'envoi');
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  // Libere les apercus locaux quand le composant disparait.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  function patch(id, changes) {
    setPending((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  async function send(item) {
    patch(item.id, { status: 'envoi', error: '' });
    try {
      const prepared = await preparePhoto(item.file);
      if (prepared.size > MAX_UPLOAD) throw new PhotoError('Photo trop lourde (8 Mo maximum).');
      let url;
      try {
        url = await uploadOnce(prepared);
      } catch (err) {
        if (err instanceof PhotoError) throw err;
        url = await uploadOnce(prepared); // une nouvelle tentative en cas de coupure reseau
      }
      const next = [...photosRef.current, url];
      photosRef.current = next;
      onChange(next);
      URL.revokeObjectURL(item.preview);
      setPending((list) => list.filter((p) => p.id !== item.id));
    } catch (err) {
      // Reessayer n'a de sens que pour un probleme de connexion, pas pour un fichier illisible.
      patch(item.id, {
        status: 'erreur',
        error: err.message || "L'envoi de la photo a échoué.",
        retryable: !(err instanceof PhotoError)
      });
    }
  }

  async function addFiles(fileList) {
    setNotice('');
    // Aucun tri sur le type annonce (souvent vide ou faux sur telephone) : chaque
    // fichier est essaye, et celui qui n'est pas une photo affiche un message.
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photosRef.current.length - pending.length;
    if (room <= 0) {
      setNotice(`Vous avez atteint le maximum de ${MAX_PHOTOS} photos.`);
      return;
    }
    if (files.length > room) {
      setNotice(`Seules les ${room} premières photos ont été ajoutées (${MAX_PHOTOS} maximum).`);
    }
    const items = files.slice(0, room).map((file) => ({
      id: ++nextId,
      file,
      preview: URL.createObjectURL(file),
      status: 'envoi',
      error: ''
    }));
    setPending((list) => [...list, ...items]);

    // Quelques envois en parallele, pas tous a la fois (connexions mobiles).
    const queue = [...items];
    await Promise.all(
      Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
        while (queue.length) await send(queue.shift());
      })
    );
  }

  function removePending(item) {
    URL.revokeObjectURL(item.preview);
    setPending((list) => list.filter((p) => p.id !== item.id));
  }

  function removePhoto(url) {
    onChange(photos.filter((p) => p !== url));
  }

  // La premiere photo sert de couverture dans les resultats de recherche.
  function makeCover(url) {
    onChange([url, ...photos.filter((p) => p !== url)]);
  }

  const total = photos.length + pending.length;
  const failed = pending.filter((p) => p.status === 'erreur');
  const shown = photos.length + pending.length - failed.length;
  const full = total >= MAX_PHOTOS;

  return (
    <div>
      {shown > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((url, i) => (
            <li key={url} className="relative aspect-[4/3] overflow-hidden border border-gray-200 bg-white">
              <Image src={url} alt={`Photo ${i + 1}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
              {i === 0 ? (
                <span className="absolute bottom-0 left-0 right-0 bg-secondary/95 py-1 text-center text-xs font-medium text-white">
                  Photo principale
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  className="absolute bottom-0 left-0 right-0 bg-white/90 py-1 text-center text-xs text-ink hover:bg-white"
                >
                  Mettre en principale
                </button>
              )}
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label={`Retirer la photo ${i + 1}`}
                className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}

          {pending
            .filter((item) => item.status === 'envoi')
            .map((item) => (
              <li key={item.id} className="relative aspect-[4/3] overflow-hidden border border-gray-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
                  <span className="bg-white/90 px-2 py-0.5 text-xs font-medium text-ink">Envoi en cours</span>
                </div>
              </li>
            ))}
        </ul>
      )}

      {failed.length > 0 && (
        <ul className="mb-4 space-y-2">
          {failed.map((item) => (
            <li key={item.id} className="flex gap-3 border border-red-200 bg-red-50 p-2" role="alert">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-red-200 bg-white text-red-400" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                  <path d="M3.5 16l5-5 4 4 2.5-2.5 5.5 5.5M9 4.5l6 15" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{item.file.name || 'Photo'}</p>
                <p className="text-xs leading-snug text-red-700">{item.error}</p>
                <div className="mt-2 flex gap-2">
                  {item.retryable && (
                    <button
                      type="button"
                      onClick={() => send(item)}
                      className="bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-light"
                    >
                      Réessayer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePending(item)}
                    className="border border-gray-300 bg-white px-3 py-1.5 text-xs hover:border-primary"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 text-center transition-colors focus-within:border-primary focus-within:bg-primary/5 ${
            total === 0 ? 'py-10' : 'py-6'
          } ${dragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white hover:border-primary hover:bg-primary/5'}`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" strokeLinejoin="round" />
              <circle cx="12" cy="12.5" r="3.5" />
            </svg>
          </span>
          <span className="text-base font-semibold text-primary">
            {total === 0 ? 'Ajouter des photos' : 'Ajouter d’autres photos'}
          </span>
          <span className="max-w-sm text-sm text-gray-500">
            Touchez ici pour choisir dans votre galerie ou prendre une photo.
            <span className="hidden sm:inline"> Sur ordinateur, vous pouvez aussi les glisser ici.</span>
          </span>
          <span className="text-xs text-gray-400">
            Plusieurs photos à la fois, jusqu&apos;à {MAX_PHOTOS}. Elles sont allégées automatiquement.
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>
          {photos.length} photo{photos.length > 1 ? 's' : ''} sur {MAX_PHOTOS}
          {busy && ', envoi en cours…'}
        </span>
        {photos.length > 1 && <span>La photo principale s&apos;affiche en premier dans les résultats.</span>}
      </div>
      {notice && <p className="mt-2 text-sm text-amber-700">{notice}</p>}
    </div>
  );
}
