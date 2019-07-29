FROM node:11.15 as base

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install && npm install request

FROM node:11.15 as final

LABEL Authors="Indra Devops Core Team"

WORKDIR /app

COPY --from=base /app/node_modules /app/node_modules

COPY lib/ /app/lib/
COPY public/ /app/public/
COPY scripts/ /app/scripts/
COPY src/ /app/src/
COPY tests/ /app/tests/
COPY app.js index.js package.json /app/

CMD [ "npm", "run", "start" ]
