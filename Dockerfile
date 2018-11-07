#FROM node:10
FROM arm32v6/node:10-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
ENV CONFIG_PATH /data
ENV LOG_PATH /var/logs
RUN mkdir $CONFIG_PATH
VOLUME $CONFIG_PATH $LOG_PATH
COPY ./src/ /app
CMD ["node", "index.js"]