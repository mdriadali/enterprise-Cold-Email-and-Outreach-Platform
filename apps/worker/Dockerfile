FROM oven/bun:1

WORKDIR /usr/src/app

COPY ./packages ./packages
COPY ./bun.lock ./bun.lock
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json 
COPY ./turbo.json ./turbo.json

COPY ./apps/worker ./apps/worker


RUN bun install
RUN bun run db:generate

# Worker doesn't need to expose any ports
CMD [ "bun", "run", "start:worker" ]
