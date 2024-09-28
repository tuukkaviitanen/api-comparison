FROM node:22-alpine

WORKDIR /usr/src/app

COPY ./node-budget-api/package*.json ./

RUN npm ci --production

COPY ./node-budget-api .

COPY ./docs/openapi.yaml .

CMD npm run docker:start
