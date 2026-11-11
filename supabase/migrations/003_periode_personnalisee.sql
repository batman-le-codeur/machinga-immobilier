-- ============================================================
-- Migration 003 : duree de location personnalisee
-- Une location peut etre indiquee pour un nombre de jours, semaines, mois ou
-- annees (ex. 60 000 FCFA pour 3 jours). Les annonces existantes gardent une
-- duree de 1. Apres la migration 002. Script re-executable sans risque.
-- ============================================================

-- Nouvelle unite : annee
alter table listings drop constraint if exists listings_periode_check;
alter table listings
  add constraint listings_periode_check check (periode in ('jour', 'semaine', 'mois', 'annee'));

-- Nombre d'unites (1 a 365)
alter table listings add column if not exists periode_nombre integer not null default 1;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_periode_nombre_check') then
    alter table listings
      add constraint listings_periode_nombre_check check (periode_nombre between 1 and 365);
  end if;
end $$;

-- Recharge le schema de l'API (PostgREST) pour qu'elle voie la nouvelle colonne.
notify pgrst, 'reload schema';
