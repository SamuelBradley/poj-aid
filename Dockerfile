#FROM node:10
FROM arm32v7/node:10
WORKDIR /app
COPY package.json /app
RUN npm install
ENV CONFIG_PATH /data/
RUN mkdir $CONFIG_PATH
VOLUME $CONFIG_PATH
COPY ./src/ /app
CMD ["node", "index.js"]