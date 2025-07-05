FROM oven/bun:1.2

WORKDIR /app

COPY package.json bun.* ./

RUN bun install

COPY src ./

RUN bunx prisma generate

RUN bun run build

EXPOSE 3000

CMD [ "bun" , "dev"]