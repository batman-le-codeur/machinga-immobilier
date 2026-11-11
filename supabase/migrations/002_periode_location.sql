-- ============================================================
-- Migration 002 : periode de location
-- Le prix d'une location peut etre indique par jour, par semaine ou par mois.
-- Les annonces existantes restent "par mois". Script re-executable sans risque.
-- ============================================================

alter table listings add column if not exists periode text not null default 'mois';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_periode_check') then
    alter table listings
      add constraint listings_periode_check check (periode in ('jour', 'semaine', 'mois'));
  end if;
end $$;

-- Recharge le schema de l'API (PostgREST) pour qu'elle voie la nouvelle colonne.
notify pgrst, 'reload schema';
