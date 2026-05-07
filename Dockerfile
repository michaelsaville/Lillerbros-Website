FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

COPY app.js config.js csrf.js mailer.js ./
COPY routes ./routes
COPY views ./views
COPY public ./public

RUN mkdir -p /app/logs && chown -R node:node /app/logs

ENV NODE_ENV=production
ENV PORT=3500

USER node
EXPOSE 3500
CMD ["node", "app.js"]
