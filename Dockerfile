# Etapa de build para React
FROM node:alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ARG ENVIRONMENT=production
ENV ENVIRONMENT=$ENVIRONMENT

RUN if [ "$ENVIRONMENT" != "development" ]; then npm run build; fi

# Etapa final
FROM node:alpine AS runtime
WORKDIR /app

RUN npm install -g serve

COPY package*.json ./
RUN npm ci

ARG ENVIRONMENT=production
ENV ENVIRONMENT=$ENVIRONMENT

# Solo copia el build si no es desarrollo
COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["/bin/sh", "-c", "if [ \"$ENVIRONMENT\" = \"development\" ]; then npm run dev; else serve -s build -l 3000 --single; fi"]
