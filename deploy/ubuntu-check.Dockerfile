# Verification environment only; production uses the systemd service.
FROM node:24.21.0-bookworm-slim AS node
FROM ubuntu:24.04
COPY --from=node /usr/local/ /usr/local/
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates nginx systemd openssl time \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/local/bin/node /usr/bin/node \
    && npm install --global pnpm@11.25.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["sh", "-ec", "sh deploy/check-config.sh; pnpm typecheck; pnpm test; /usr/bin/time -v pnpm build; pnpm check:bundles; pnpm smoke:production"]
