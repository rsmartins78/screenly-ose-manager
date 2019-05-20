FROM node:11.15

ADD src/ /app/

WORKDIR /app

RUN npm install

ENTRYPOINT [ "npm", "start", "prod" ]
