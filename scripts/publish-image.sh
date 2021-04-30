#!/bin/bash

set -e

docker build -t docker.devbg.us/bostongene/drugs-annotations:develop .

docker image push docker.devbg.us/bostongene/drugs-annotations:develop
