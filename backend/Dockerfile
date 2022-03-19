# Dockerfile adapted from
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./api/package.json ./

RUN npm install

# Bundle app source
COPY ./api .

EXPOSE 3000
CMD [ "nodemon", "app.js" ]