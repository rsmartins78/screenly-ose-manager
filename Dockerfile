FROM node:11.15

ADD src/ lib/ public/ scripts/ semantic/ tests/ index.js app.js package.json semantic.json yarn.lock /app/

WORKDIR /app

RUN npm install

ENTRYPOINT [ "npm", "run", "start" ]
