-- ============================================================
-- Migration 001 : marketplace de locations (phase 1)
-- A executer UNE FOIS sur la base existante (Supabase > SQL Editor > Run),
-- apres schema.sql. Script re-executable sans risque.
--
-- - Comptes proprietaires (table owners, liee aux utilisateurs Supabase Auth)
-- - Annonces deposees par les proprietaires, soumises a validation
-- - Ville / quartier structures pour la recherche
-- ============================================================

-- ---------- Proprietaires ----------
create table if not exists owners (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null,
  telephone text not null,
  email text not null,
  date_inscription timestamptz not null default now()
);

alter table owners enable row level security;
-- Aucune politique publique : uniquement accessible via la cle service role
-- (routes API serveur).

-- Adresse e-mail confirmee par code (obligatoire pour publier).
alter table owners add column if not exists email_verifie boolean not null default false;

-- ---------- Codes a usage unique envoyes par e-mail ----------
-- Verification de l'adresse a l'inscription et mot de passe oublie. Seule
-- l'empreinte (HMAC) du code est stockee, jamais le code lui-meme.
create table if not exists email_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  purpose text not null check (purpose in ('verification', 'reinitialisation')),
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists email_codes_lookup_idx on email_codes (email, purpose, created_at desc);

alter table email_codes enable row level security;
-- Aucune politique publique : cle service role uniquement.

-- ---------- Annonces : proprietaire et moderation ----------
-- owner_id NULL = annonce creee par MACHINGA depuis l'espace admin.
alter table listings add column if not exists owner_id uuid references owners (id) on delete cascade;

-- Les annonces existantes (creees par MACHINGA) restent publiees.
alter table listings add column if not exists moderation text not null default 'publiee';
alter table listings add column if not exists motif_refus text;
alter table listings add column if not exists ville text;
alter table listings add column if not exists quartier text;
alter table listings add column if not exists date_modification timestamptz;
-- Annonces de proprietaires : masquees du public apres cette date, sauf
-- renouvellement (NULL pour les annonces MACHINGA, qui n'expirent pas).
alter table listings add column if not exists expire_le timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listings_moderation_check'
  ) then
    alter table listings
      add constraint listings_moderation_check
      check (moderation in ('en_attente', 'publiee', 'refusee'));
  end if;
end $$;

-- Origine de l'annonce, calculee : 'machinga' (equipe, owner_id vide) ou
-- 'particulier'. Sert a separer et a trier les annonces (certifiees d'abord).
alter table listings add column if not exists source text
  generated always as (case when owner_id is null then 'machinga' else 'particulier' end) stored;

create index if not exists listings_moderation_idx on listings (moderation);
create index if not exists listings_source_idx on listings (source);
create index if not exists listings_owner_idx on listings (owner_id);
create index if not exists listings_prix_idx on listings (prix);

-- Lecture publique limitee aux annonces validees (cle anon, si un jour
-- utilisee cote client ; le site passe aujourd'hui par la cle service role).
drop policy if exists "Lecture publique des annonces" on listings;
create policy "Lecture publique des annonces" on listings
  for select using (moderation = 'publiee');

-- ---------- Evenements sur les annonces (statistiques admin) ----------
-- Clics sur "Appeler l'annonceur" : mesure les contacts generes par la
-- marketplace pendant la phase de test. Visible uniquement dans l'admin.
create table if not exists listing_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  type text not null check (type in ('appel')),
  visitor_id text,
  created_at timestamptz not null default now()
);

create index if not exists listing_events_listing_idx on listing_events (listing_id);
create index if not exists listing_events_created_idx on listing_events (created_at);

alter table listing_events enable row level security;
-- Aucune politique publique : cle service role uniquement.
