#!/bin/sh

which aws 
aws=$?

set -e

if [ $aws -eq 1 ]
then
    echo "CAUTION: aws is not installed on this machine."
    echo "         Artefacts won't be published at https://s3-us-west-2.amazonaws.com/cec-library/"
    echo "         but in ./build"
    export WORKSPACE=$(PWD)
    mkdir -p ${WORKSPACE}/build
else
    export AWS_DEFAULT_PROFILE=cec
    date
    pwd
    env | sort
fi

repl() { printf "$1"'%.s' $(eval "echo {1.."$(($2))"}"); }
title() {
    title=$1
    echo ""
    echo "=========================================================================================="
    echo $title
    repl " -" $((${#title}/2))
    echo ""
}

title "Install dependencies:"
npm install


title "[spotfire-webplayer] Build the NPM package:"
./node_modules/.bin/ng build spotfire-webplayer

title "[spotfire-webplayer] Create the NPM package:"
(cd dist/spotfire-webplayer/ ; npm pack)

title "[spotfire-webplayer] Publish the NPM package to verdaccio:"
(cd dist/spotfire-webplayer ; npm publish --registry http://rcxxxxbld12.na.tibco.com:4873 )

if [ $aws -eq 0 ]
then
    title "[spotfire-webplayer] Copy the NPM package to S3:"
    aws s3 cp ${WORKSPACE}/dist/spotfire-webplayer/*.tgz s3://cec-library/spotfire-wrapper.tgz
else
    cp -f ${WORKSPACE}/dist/spotfire-webplayer/*.tgz ${WORKSPACE}/build/spotfire-wrapper.tgz
fi

if [ $aws -eq 0 ]
then
    title "[spotfire-wrapper] Install the NPM package from S3 (used to build the WebElement Library):"
    npm install https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.tgz --no-save
    
else
    title "[spotfire-wrapper] Install the NPM package from local path (used to build the WebElement Library):"
    npm install @tibco/spotfire-wrapper --registry http://rcxxxxbld12.na.tibco.com:4873
   # npm install ${WORKSPACE}/build/spotfire-wrapper.tgz --no-save
fi

title "[spotfire-wrapper] Build the WebElement Library:"
npm run build:elements

if [ $aws -eq 0 ]
then
    title "[spotfire-wrapper] Copy the WebElement Library to S3:"
    aws s3 cp elements/spotfire-wrapper.js s3://cec-library/
else
    cp -f elements/spotfire-wrapper.js ${WORKSPACE}/build/
fi

echo ""
echo ""
echo "How to use: "
echo "  - npm install https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.tgz"
echo "  - <script src='https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.js'></script>"
echo ""
echo ""
[ $aws -eq 1 ] && ls -lrt ${WORKSPACE}/build/
echo ""
echo "Done!"

