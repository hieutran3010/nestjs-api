ARG NODE_VERSION=8.11.3
FROM ubuntu:16.04
LABEL maintainer="Thuoc Nam Le <thuocle@fless.vn>"
LABEL name="nest-be-platform"
RUN mkdir -p /src
WORKDIR /src

# Make sure apt is up to date
RUN apt-get update \
    && apt-get upgrade -y

# Install necessary packages
RUN apt-get install -y --no-install-recommends \
    apt-utils curl ca-certificates file g++ git locales make uuid-runtime \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN localedef -i en_US -f UTF-8 en_US.UTF-8 \
    && useradd -m -s /bin/bash linuxbrew \
    && echo 'linuxbrew ALL=(ALL) NOPASSWD:ALL' >>/etc/sudoers

USER linuxbrew
WORKDIR /home/linuxbrew

# Install linuxbrew
RUN git clone https://github.com/Linuxbrew/brew.git .linuxbrew
ENV PATH=/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:$PATH \
    SHELL=/bin/bash

# Install neccesary packages
RUN brew install -y pkg-config cairo pango libpng jpeg giflib

FROM node:${NODE_VERSION}
# Install the latest version of npm
RUN npm i npm@latest -g
# Install node-gyp
RUN npm install -g node-gyp

# Copy all necessary files (package.json, package-lock.json)
COPY package*.json ./
# COPY yarn.lock ./

# Install yarn package manager
# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
# RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
# RUN apt-get update && apt-get install -y yarn
# RUN yarn --version

RUN npm install
RUN npm install bcrypt @types/bcrypt

COPY . .

EXPOSE 3000

ENV environment=start:uat DB_SERVER=localhost:27017 REDIS_HOST=localhost REDIS_PORT=6379 REDIS_PASSWORD=mypass
CMD ["sh", "-c", "npm run ${environment}"]