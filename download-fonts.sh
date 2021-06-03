#!/bin/sh

n="kurale"

curl "https://google-webfonts-helper.herokuapp.com/api/fonts/kurale?download=zip&subsets=latin-ext,latin&variants=regular&formats=woff,woff2" -o "$n.zip"

mkdir "$n"
unzip "$n.zi"p -d "$n"

mv "$n"/* "public/fonts/"

rmdir "$n"
rm "$n.zip"

n="cairo"

curl "https://google-webfonts-helper.herokuapp.com/api/fonts/cairo?download=zip&subsets=latin-ext,latin&variants=300,700&formats=woff,woff2" -o "$n.zip"

mkdir "$n"
unzip "$n.zip" -d "$n"

mv "$n"/* "public/fonts/"

rmdir "$n"
rm "$n.zip"

