FROM node:20 AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma
RUN npm install -g pnpm
RUN pnpm install
RUN npx prisma generate
COPY . .
RUN pnpm run build

FROM node:20 AS runner
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma
COPY start.sh ./
RUN npm install -g pnpm
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
RUN chmod +x ./start.sh
EXPOSE 3000
CMD ["./start.sh"]
