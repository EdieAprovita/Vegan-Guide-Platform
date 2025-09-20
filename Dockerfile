# Install dependencies only when needed
FROM node:20.3.0-alpine AS deps
WORKDIR /app

# Install dependencies based on the preferred lockfile
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1
ARG NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY public/ ./public/
COPY next.config.js ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY components.json ./
COPY package.json ./
RUN npm run build

# Production image, copy all the files from `builder` stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1
ARG NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Install only production dependencies for runtime
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

EXPOSE 5000
CMD ["npm", "start"]
