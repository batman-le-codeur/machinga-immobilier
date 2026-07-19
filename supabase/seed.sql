-- Données de démonstration. À exécuter après schema.sql si tu veux voir des
-- exemples d'annonces sur le site. Tu peux aussi tout supprimer et créer tes
-- propres annonces depuis /admin.

insert into listings (type, category, titre, prix, localisation, surface, chambres, salles_de_bain, description, photos, statut)
values
  ('location', 'Apparts/Maisons', 'Appartement 3 pièces meublé - Glass', 350000, 'Glass, Libreville', 85, 2, 1,
   'Bel appartement meublé et sécurisé, proche des commodités, idéal pour un jeune couple ou un professionnel.', '{}', 'disponible'),
  ('location', 'Chambres/Studios', 'Studio moderne - Nzeng-Ayong', 120000, 'Nzeng-Ayong, Libreville', 25, 1, 1,
   'Studio calme et lumineux, quartier résidentiel bien desservi.', '{}', 'disponible'),
  ('vente', 'Terrains', 'Terrain viabilisé 600 m² - Après l''Union', 15000000, 'Après l''Union, Libreville', 600, null, null,
   'Terrain plat, titré, proche axe principal, idéal pour construction résidentielle.', '{}', 'disponible'),
  ('vente', 'Apparts/Maisons', 'Villa 4 chambres avec jardin - Angondjé', 65000000, 'Angondjé, Libreville', 220, 4, 3,
   'Villa familiale avec jardin, garage double et espace de vie généreux.', '{}', 'disponible');
