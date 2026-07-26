# MACHINGA IMMOBILIER - site web

Site immobilier pour S.C.I MACHINGA IMMOBILIER (Libreville, Gabon).

## Stack

- **Next.js 14** (App Router) + **Tailwind CSS**
- **Supabase** (PostgreSQL + Storage) - base de données réelle et stockage des photos
- **Web3Forms** - notification email quand un visiteur envoie le formulaire de contact
- Authentification admin simple (mot de passe unique, cookie de session signé)
- Déploiement en conteneur Docker, prêt pour **Coolify**

Aucun compte WordPress, aucun CMS externe : tu gères tes annonces et tes photos
depuis `/admin`, directement enregistrées dans ta base Supabase.

---

## 1. Créer le projet Supabase (5 minutes)

1. Crée un compte sur [supabase.com](https://supabase.com) et un nouveau projet.
2. Va dans **SQL Editor**, colle le contenu de `supabase/schema.sql`, puis **Run**.
   Cela crée les tables `listings` et `messages`, active la sécurité (RLS), et
   crée le bucket de stockage `photos` pour les images.
3. (Optionnel) Colle ensuite `supabase/seed.sql` et **Run** pour avoir 4 annonces
   de démonstration.
4. Va dans **Project Settings > API** et récupère :
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (⚠️ secrète, jamais exposée au navigateur) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Lancer le site en local

Prérequis : Node.js 20+.

```bash
cp .env.example .env.local
# puis édite .env.local avec tes vraies valeurs Supabase, ton mot de passe admin, etc.

npm install
npm run dev
```

Le site est disponible sur http://localhost:3000, l'espace admin sur
http://localhost:3000/admin (mot de passe = `ADMIN_PASSWORD` dans `.env.local`).

## 3. Variables d'environnement

Voir `.env.example` pour la liste complète et des exemples. En résumé :

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL de ton projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (secrète, jamais côté client) |
| `ADMIN_PASSWORD` | Mot de passe pour te connecter à `/admin` |
| `SESSION_SECRET` | Chaîne aléatoire longue, sert à signer le cookie de session |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Clé gratuite sur [web3forms.com](https://web3forms.com), pour recevoir un email à chaque message de contact (appelée depuis le navigateur, doit rester préfixée `NEXT_PUBLIC_`) |
| `CONTACT_TELEPHONE`, `CONTACT_EMAIL` | Coordonnées affichées sur le site (footer, page contact) |

## 4. Gérer les annonces et les photos (usage quotidien)

Tout se passe sur `/admin` après connexion :

- **Annonces** : bouton "+ Nouvelle annonce" pour créer, "Modifier" / "Supprimer"
  sur chaque annonce existante. Les photos s'ajoutent directement en glissant un
  ou plusieurs fichiers (JPEG, PNG ou WebP, 8 Mo max chacun) - elles sont
  envoyées automatiquement vers Supabase Storage, aucune manipulation de
  serveur nécessaire.
- **Messages** : tous les messages du formulaire de contact arrivent dans
  l'onglet "Messages", avec un compteur de messages non lus sur le tableau de
  bord. Tu peux les marquer comme lus ou les supprimer.

Les textes des pages "Nous découvrir", horaires, informations légales, etc.
sont dans le code (`app/nous-decouvrir/page.js`, `components/Footer.js`) - dis-moi
si tu préfères pouvoir les éditer aussi depuis l'admin, ce serait une évolution
simple à ajouter.

## 5. Déployer sur Coolify

Le projet contient un `Dockerfile` prêt à l'emploi (multi-stage, image finale
légère basée sur `node:20-alpine`, sortie Next.js "standalone").

1. Pousse ce projet sur un dépôt GitHub.
2. Dans Coolify : **New Resource > Application**, choisis ton dépôt, méthode de
   build **Dockerfile** (celui à la racine du projet est détecté automatiquement).
3. Renseigne les variables d'environnement (les mêmes que `.env.example`) dans
   l'onglet **Environment Variables** de Coolify - surtout `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_WEB3FORMS_KEY`.
4. Port de l'application : `3000`.
5. Active le déploiement automatique sur push si tu veux du déploiement continu.
6. Lance le déploiement. Aucun volume disque n'est nécessaire : les annonces
   sont dans Supabase, les photos dans Supabase Storage - le conteneur peut
   être redéployé ou recréé sans perte de données.

## 6. Maintenance

- **Sauvegardes** : Supabase effectue des sauvegardes automatiques (voir
  Project Settings > Database > Backups). Pour un export manuel, utilise
  **Database > Backups > Download** ou `pg_dump` avec la chaîne de connexion
  fournie par Supabase.
- **Mettre à jour le site** : `git pull`, puis redéploiement Coolify (ou
  automatique si activé).
- **Changer le mot de passe admin** : modifie `ADMIN_PASSWORD` dans les
  variables d'environnement Coolify, puis redéploie.
- **Espace de stockage photos** : géré par Supabase Storage (offert jusqu'à 1 Go
  sur le plan gratuit, extensible ensuite).
- **Sécurité** : la clé `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais apparaître
  dans du code exécuté côté navigateur - elle n'est utilisée que dans
  `lib/supabaseAdmin.js`, importé uniquement par des routes API serveur.

---

## Structure du projet

```
app/
  page.js                  Accueil
  nous-decouvrir/page.js   Qui sommes-nous, services, philosophie, fondateur
  locations/page.js        Grille des locations + filtres
  ventes/page.js           Grille des ventes + filtres
  contact/page.js          Formulaire de contact + coordonnées + carte
  admin/page.js            Connexion admin
  admin/dashboard/page.js  Tableau de bord (annonces + messages)
  api/                     Routes API (listings, messages, upload, auth, contact)
components/                Composants réutilisables (Header, Footer, cartes, etc.)
components/admin/          Composants du dashboard admin
lib/                       Client Supabase, données publiques, auth
supabase/schema.sql        Schéma de base de données à exécuter sur Supabase
supabase/seed.sql          Données de démonstration (optionnel)
middleware.js              Protection des routes admin et des API d'écriture
Dockerfile                 Build de production pour Coolify
```
