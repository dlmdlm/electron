#!/bin/bash

set -xe

sudo rm -rf dist .electron-symbols

yarn install

docker run --rm -it -v ${PWD}:/project electronuserland/builder:wine sh -c "node_modules/.bin/electron-builder -w nsis"
