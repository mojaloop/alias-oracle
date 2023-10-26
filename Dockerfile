FROM node:lts-alpine as builder

RUN apk add --no-cache git python build-base

WORKDIR /opt/alias-oracle

COPY package.json package-lock.json* /opt/alias-oracle/
COPY src /opt/alias-oracle/src

# RUN npm ci --production
RUN npm install

FROM node:lts-alpine

WORKDIR /opt/alias-oracle

COPY --from=builder /opt/alias-oracle .

EXPOSE 3000

CMD ["npm", "start"]
