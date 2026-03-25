FROM node:24-alpine

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat curl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD npm run migrate && npm start
