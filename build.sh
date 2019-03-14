#!/bin/sh 

which aws 
aws=$?

set -e

if [ $aws -eq 1 ]
then
    echo "CAUTION: aws is not installed on this machine. Artefacts won't be published at https://s3-us-west-2.amazonaws.com/cec-library/"
    export WORKSPACE=$(PWD)
    mkdir -p ${WORKSPACE}/build
else
    export AWS_DEFAULT_PROFILE=cec
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
date
pwd
env | sort

title "Install dependencies:"
npm install


title "[spotfire-webplayer] Build the NPM package:"
./node_modules/.bin/ng build spotfire-webplayer

title "[spotfire-webplayer] Create the NPM package:"
(cd dist/spotfire-webplayer/ ; npm pack)

if [ $aws -eq 0 ]
then
    title "[spotfire-webplayer] Copy the NPM package to S3:"
    aws s3 cp ${WORKSPACE}/dist/spotfire-webplayer/spotfire-webplayer-0.0.1.tgz s3://cec-library/
else
    cp -f ${WORKSPACE}/dist/spotfire-webplayer/spotfire-webplayer-0.0.1.tgz ${WORKSPACE}/build/
fi

title "[spotfire-wrapper] Install the NPM package from S3 (used to build the WebElement Library):"
npm install https://s3-us-west-2.amazonaws.com/cec-library/spotfire-webplayer-0.0.1.tgz

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
echo "  - npm install https://s3-us-west-2.amazonaws.com/cec-library/spotfire-webplayer-0.0.1.tgz"
echo "  - <script src='https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.js'></script>"
echo ""
echo ""
[ $aws -eq 1 ] && ls -lrt ${WORKSPACE}/build/
echo ""
echo "Done!"

