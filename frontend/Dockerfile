FROM node:12 as builder

WORKDIR /src

COPY package.json yarn.lock /src/
RUN yarn install

COPY . /src/
RUN yarn build

FROM nginx:1.19

# см. https://hub.docker.com/_/nginx
COPY --from=builder /src/build /usr/share/nginx/html/drug-annotations
COPY nginx.conf /etc/nginx/nginx.conf
