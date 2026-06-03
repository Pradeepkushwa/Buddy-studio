# ── LOCAL DEV ONLY ─────────────────────────────────────────────────────────────
# Render deployment uses static site build — NOT this Dockerfile.
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install deps first (cached layer — only re-runs if package.json changes)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Required for file-watching inside Docker on Mac
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

CMD ["npm", "start"]
