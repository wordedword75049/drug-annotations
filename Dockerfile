FROM node:12 as builder

WORKDIR /src

COPY frontend/package.json frontend/yarn.lock /src/
RUN yarn install

COPY frontend/ /src/
RUN yarn build

FROM python:3.8

ARG package_args="--allow-downgrades --allow-remove-essential --allow-change-held-packages --no-install-recommends"

RUN export DEBIAN_FRONTEND=noninteractive \
  && apt-get -q ${package_args} update \
  && apt-get -y ${package_args} install nginx \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* /tmp/*

COPY backend/requirements.txt /backend/
RUN pip3 install -r /backend/requirements.txt --no-cache-dir

COPY backend/ /backend/
COPY alembic.ini /alembic.ini
COPY --from=builder /src/build /usr/share/nginx/html/drug-annotations
COPY frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

COPY ./run-container.sh .
ENTRYPOINT [ "./run-container.sh" ]
