FROM node:lts-alpine

ENV NODE_ENV=production

RUN mkdir -p /nodeServe

COPY . /nodeServe

WORKDIR /nodeServe


RUN npm config set registry "https://registry.npm.taobao.org/" \
    && npm install

EXPOSE 5050

CMD ["npm", "run", "dev"]
