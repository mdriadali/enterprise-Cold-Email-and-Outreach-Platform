FROM oven/bun:1

WORKDIR /usr/src/app

ARG DATABASE_URL
ARG REDIS_HOST
ARG REDIS_PORT

COPY ./packages ./packages
COPY ./bun.lock ./bun.lock
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json 
COPY ./turbo.json ./turbo.json

COPY ./apps/worker ./apps/worker

RUN echo "DATABASE_URL=$DATABASE_URL" > .env.local && \
    echo "REDIS_HOST=$REDIS_HOST" >> .env.local && \
    echo "REDIS_PORT=$REDIS_PORT" >> .env.local

RUN bun install
RUN bun run db:generate

# Worker doesn't need to expose any ports
CMD [ "bun", "run", "start:worker" ]
