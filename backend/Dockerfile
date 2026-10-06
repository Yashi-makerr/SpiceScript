FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

COPY backend/ ./

COPY frontend/ /frontend

EXPOSE 5000

CMD ["npm", "start"]