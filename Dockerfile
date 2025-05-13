# Etapa de build
FROM node:alpine3.21 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}


RUN npm run build

# Imagen final
FROM node:alpine3.21
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
