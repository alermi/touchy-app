FROM node:14.15.1-alpine

RUN mkdir -p /srv/app/touchy-client
WORKDIR /srv/app/touchy-client

COPY package.json /srv/app/touchy-client
COPY package-lock.json /srv/app/touchy-client

RUN npm install

COPY . /srv/app/touchy-client
# COPY ./src /srv/app/touchy-client/src
COPY ./public /srv/app/touchy-client/public

CMD [ "npm", "start" ]