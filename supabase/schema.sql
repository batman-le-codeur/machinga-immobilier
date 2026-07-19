-- ============================================================
-- Schéma MACHINGA IMMOBILIER
-- À exécuter dans Supabase : SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Table des annonces ----------
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('location', 'vente')),
  category text not null,
  titre text not null,
  prix numeric not null default 0,
  localisation text not null default '',
  surface numeric,
  chambres integer,
  salles_de_bain integer,
  description text default '',
  photos text[] default '{}',
  statut text not null default 'disponible' check (statut in ('disponible', 'reserve', 'loue_vendu')),
  date_ajout timestamptz not null default now()
);

create index if not exists listings_type_idx on listings (type);
create index if not exists listings_category_idx on listings (category);

-- ---------- Table des messages de contact ----------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text not null,
  telephone text,
  type_transaction text,
  type_logement text,
  ville text,
  quartier text,
  consentement boolean not null default false,
  message text not null,
  lu boolean not null default false,
  date_envoi timestamptz not null default now()
);

-- Ajoute les colonnes ci-dessus si la table existait deja avant leur ajout
-- (script re-executable sans risque grace a IF NOT EXISTS).
alter table messages add column if not exists type_transaction text;
alter table messages add column if not exists type_logement text;
alter table messages add column if not exists ville text;
alter table messages add column if not exists quartier text;
alter table messages add column if not exists consentement boolean not null default false;

-- ---------- Row Level Security ----------
-- Le site utilise la clé "service role" côté serveur (routes API Next.js
-- uniquement, jamais exposée au navigateur), qui contourne RLS. On active
-- quand même RLS avec une politique de lecture publique sur les annonces,
-- au cas où la clé publique (anon) serait utilisée un jour côté client.

alter table listings enable row level security;
alter table messages enable row level security;

drop policy if exists "Lecture publique des annonces" on listings;
create policy "Lecture publique des annonces" on listings
  for select using (true);

-- Aucune politique d'écriture publique : seule la clé service role
-- (utilisée uniquement dans les routes API protégées par l'admin) peut
-- créer, modifier ou supprimer une annonce ou un message.

-- ---------- Stockage des photos ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Lecture publique des photos" on storage.objects;
create policy "Lecture publique des photos"
  on storage.objects for select
  using (bucket_id = 'photos');

-- ---------- Table de suivi des visites (statistiques admin) ----------
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  visitor_id text,
  created_at timestamptz not null default now()
);

alter table page_views add column if not exists visitor_id text;

create index if not exists page_views_created_at_idx on page_views (created_at);
create index if not exists page_views_path_idx on page_views (path);
create index if not exists page_views_visitor_id_idx on page_views (visitor_id);

alter table page_views enable row level security;
-- Aucune politique publique : seule la clé service role (route API
-- /api/track, appelée par le tracker côté client) peut y écrire, et seul le
-- dashboard admin (également via service role) peut la lire.
