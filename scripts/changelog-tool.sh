#!/usr/bin/env bash
set -x
PACKAGE_JSON_PATH=$1

PACKAGE_NAME=`cat $PACKAGE_JSON_PATH | jq .name | tr -d '"'`

PACKGE_FOLDER=`dirname $PACKAGE_JSON_PATH`

cd $PACKGE_FOLDER
mkdir changelog-temp
cd changelog-temp
npm pack $PACKAGE_NAME
if [ $? == 1 ]; then
    cd ..
    touch CHANGELOG.md
    echo '**0.1.0**' >> CHANGELOG.md
    echo '' >> CHANGELOG.md
    echo '  - Initial Release' >> CHANGELOG.md
    exit 0
fi

tar -xzf *.tgz
API_MD_NPM=`ls package/review/*.api.md`
API_MD_NPM=`pwd`/$API_MD_NPM
PACKAGE_VERSION_NPM=`cat package/package.json | jq .version |  tr -d '"'`
cd ..
API_MD_LOCAL=`ls review/*.api.md`
API_MD_LOCAL=`pwd`/$API_MD_LOCAL

generate-changlog $API_MD_NPM $API_MD_LOCAL >> ./changelog-temp/changelog

if cat ./changelog-temp/changelog | grep -q 'Breaking Changes'; then
  LATEST_PACKAGE_VERSION=
fi
