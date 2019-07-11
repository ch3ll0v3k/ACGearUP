#!/bin/bash

echo " > x64"
electron-packager . ACGearUP --platform=linux --arch=x64 --no-sandbox --overwrite
cp ./StartApp.sh ./ACGearUP-linux-x64/
chmod +x ./ACGearUP-linux-x64/StartApp.sh

# DEPRECATED.
# echo " > x32"
# electron-packager . ACGearUP --platform=linux --arch=ia32 --no-sandbox --overwrite
# cp ./StartApp.sh ./ACGearUP-linux-ia32/
# chmod +x ./ACGearUP-linux-ia32/StartApp.sh

