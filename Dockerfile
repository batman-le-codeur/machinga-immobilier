# --- Dépendances ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev=false

# --- Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ces variables ne sont nécessaires qu'à l'exécution (routes API), pas au
# build : on met des valeurs factices pour que `next build` ne plante pas.
ENV SUPABASE_URL=https://placeholder.supabase.co
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder

# Les variables NEXT_PUBLIC_* sont injectées en dur dans le JS envoyé au
# navigateur au moment du build (pas à l'exécution) : elles doivent donc être
# passées ici via --build-arg. Dans Coolify, marquer ces variables comme
# "Build Variable" (ou équivalent) pour qu'elles soient transmises au build
# Docker, en plus d'être disponibles à l'exécution du conteneur.
ARG NEXT_PUBLIC_WEB3FORMS_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_WEB3FORMS_KEY=$NEXT_PUBLIC_WEB3FORMS_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

# --- Image finale ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
