# ── LOCAL DEV ONLY ─────────────────────────────────────────────────────────────
# Render deployment uses native Ruby build — NOT this Dockerfile.
# Uses SQLite for local dev (same as development env config in database.yml).
# ───────────────────────────────────────────────────────────────────────────────
FROM ruby:3.4.7-slim

# System dependencies
RUN apt-get update && apt-get install -y \
  build-essential \
  libsqlite3-dev \
  libyaml-dev \
  nodejs \
  npm \
  curl \
  git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install gems first (cached layer)
COPY Gemfile Gemfile.lock ./
RUN bundle install --without production

# Copy source code
COPY . .

# Create and migrate DB on first run
RUN bundle exec rails db:create db:migrate RAILS_ENV=development 2>/dev/null || true

EXPOSE 3001

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3001"]
