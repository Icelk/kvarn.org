#!/bin/sh

curl "https://google-webfonts-helper.herokuapp.com/api/fonts/kurale?download=zip&subsets=latin-ext,latin&variants=regular&formats=woff,woff2" -o kurale.zip

mkdir kurale
unzip kurale.zip -d kurale

mv kurale/* public/fonts/

rmdir kurale
rm kurale.zip
