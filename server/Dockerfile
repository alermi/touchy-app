FROM node:14.15.1-alpine

RUN mkdir -p /srv/app/touchy-server
WORKDIR /srv/app/touchy-server

COPY package.json /srv/app/touchy-server
COPY package-lock.json /srv/app/touchy-server

RUN npm install

COPY . /srv/app/touchy-server
# COPY ./bin/www /srv/app/touchy-server/bin/www
# COPY ./src /srv/app/touchy-server/src
# COPY ./routes /srv/app/touchy-server/routes
COPY ./public /srv/app/touchy-server/public

CMD [ "npm", "start" ]