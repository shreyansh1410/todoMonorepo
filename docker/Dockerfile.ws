FROM node:23-alpine

RUN npm install -g pnpm@9.0.0

WORKDIR /usr/src/app

COPY . .

RUN pnpm install

RUN pnpm run generate:db

RUN cd apps/ws && pnpm run build

EXPOSE 8081

CMD ["pnpm", "start:ws"]