#!/bin/bash

set -eu

if [ -z "$1" ]
then
  echo "You must specify argument: 'frontend' or 'backend'"
fi

if [ "$1" == frontend ]
then
  API_HOST="${API_HOST:-backend}"
  API_PORT="${API_PORT:-5000}"
  sed -i 's|(((API_HOST)))|'$API_HOST'|' /etc/nginx/nginx.conf
  sed -i 's|(((API_PORT)))|'$API_PORT'|' /etc/nginx/nginx.conf
  nginx -g "daemon off;"
fi

if [ "$1" == backend ]
then
  alembic upgrade head
  cd /backend
  gunicorn --bind 0.0.0.0:5000 app:app
fi
