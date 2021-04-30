#!/bin/bash

set -e

docker-compose -H localhost -f docker-compose.dev-3.yml pull
docker-compose -H localhost -f docker-compose.dev-3.yml up -d
psql -h localhost -U postgres -W drug-annotations < ./drug-annotations.dump
