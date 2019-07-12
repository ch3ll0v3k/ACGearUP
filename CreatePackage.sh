#!/bin/bash

# linux x32 IS DEPRECATED.

echo " > x64"
rm -rf ./ACGearUP-linux-x64/*
electron-packager . ACGearUP --platform=linux --arch=x64 --no-sandbox --overwrite --ignore="build-bundles"
cp ./StartApp.sh ./ACGearUP-linux-x64/
chmod +x ./ACGearUP-linux-x64/StartApp.sh

du -sh ./ACGearUP-linux-x64/

version=$( cat package.json | grep version | cut -d'"' -f4 )
tar -c ACGearUP-linux-x64/ | xz -v -9 > "./build-bundles/ACGearUP-linux-x64.v$version.tar.xz"
