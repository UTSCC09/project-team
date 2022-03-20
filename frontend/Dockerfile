# Dockerfile adapted from
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:16

# Bundle app source
COPY . /usr/src/app/

RUN chown 1000:1000 /usr/src/app -R
USER 1000:1000

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package.json ./

RUN npm install -f

EXPOSE 3000
CMD [ "npm", "start" ]