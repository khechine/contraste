# =====================================================
# Stage 1: Install dependencies
# =====================================================
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# =====================================================
# Stage 2: Build the Next.js application
# =====================================================
FROM node:22-alpine AS builder
WORKDIR /app

# Install ALL deps (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build-time env vars (injected via docker-compose build args)
ARG NEXT_PUBLIC_DIRECTUS_URL=https://directus.contraste.tn
ENV NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL

RUN npm run build

# =====================================================
# Stage 3: Production runtime (lean image)
# =====================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built output and production deps only
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
