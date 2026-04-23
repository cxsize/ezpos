# Node image used for Metro (Expo dev server), typecheck, lint, and the
# Firestore seed script. Heavy iOS / Android builds live on the host — see
# docker-compose.yml and README "Docker" section.
FROM node:22-bookworm-slim

ENV CI=false \
    EXPO_NO_TELEMETRY=1 \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# watchman is used by Metro on file change; git is pulled in by a few expo deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        ca-certificates \
        tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies install is a separate layer so source edits don't bust the cache.
# Prefer `npm ci` when a lock file is present (fast + deterministic); fall back
# to `npm install --legacy-peer-deps` otherwise. Expo's peer-dep graph
# (react-native / reanimated / react-dom) needs the legacy-peer-deps relax.
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps --no-audit --no-fund ; \
    else \
      npm install --legacy-peer-deps --no-audit --no-fund ; \
    fi

# App source is bind-mounted at runtime via docker-compose; no COPY here.

EXPOSE 8081 19000 19001 19002 19006

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start"]
