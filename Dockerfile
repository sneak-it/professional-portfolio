FROM node:26-trixie-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager.
# --no-audit: CI's quality job already runs `npm audit` against this lockfile.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Pre-create the writable cache tree here rather than in a runtime stage:
# distroless has no shell, so mkdir/chown must happen in a stage that has one.
# Kept above `COPY . .` so a source change doesn't re-run it and re-export the layer.
RUN mkdir -p /empty-cache/images

COPY . .

RUN npm run build && rm -f .next/standalone/.env .next/standalone/.env.production

# Stage 3: Non-root production image (distroless)

FROM gcr.io/distroless/nodejs26-debian13:latest AS production-nonroot

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
# Not traced by Next: read at runtime by app/media/[...path].
COPY --from=builder /app/media ./media

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
#
# The standalone tree is nonroot-owned because ISR writes revalidated pages back
# into .next/server/app, not just into .next/cache; leaving it root-owned makes
# revalidation fail with EACCES. public/, media/, .next/static and @img below are
# never written at runtime, so they stay root-owned and read-only to the app.
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Next's output tracing picks up sharp's .node addon but not the libvips shared
# library it dlopens, so the image optimizer fails with ERR_DLOPEN_FAILED on a
# standalone-only copy. Restore the full @img tree (arch-correct, since deps ran
# npm ci for the target platform).
COPY --from=deps /app/node_modules/@img ./node_modules/@img

# Next also writes the ISR/fetch cache and optimized images here. Copying the
# dir in with --chown means a named volume mounted at that path (see
# docker-compose.yml) is initialized as nonroot-owned rather than root-owned.
COPY --from=builder --chown=nonroot:nonroot /empty-cache ./.next/cache

USER nonroot

# Expose port 3000
EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# Set image metadata labels
LABEL org.opencontainers.image.title="professional-portfolio"
LABEL org.opencontainers.image.description="Professional portfolio and blog"
LABEL org.opencontainers.image.source="https://github.com/sneak-it/professional-portfolio"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT}/api/health`).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

# node is the ENTRYPOINT in the distroless image; pass the server bundle as its argument
CMD ["server.js"]

# Stage 4: Root production image (default)
# Identical layers to the non-root image above, but runs as root. Root is the
# default because it is the last stage, so a plain `docker build .` produces it;
# the non-root image is the hardened variant, published as :<tag>-nonroot.
FROM production-nonroot AS production

USER root
