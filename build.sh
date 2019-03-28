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

repl() { printf -- "$1"'%.s' $(eval "echo {1.."$(($2))"}"); }
title() {
    title=$1
    echo ""
    echo "=========================================================================================="
    echo $title
    repl "- " $((${#title}/2+1))
    echo ""
}
rm -rf node_modules/\@tibco node_modules/spotfire-w*

title "Install dependencies:"
npm install


title "[spotfire-webplayer] Build the NPM package:"
./node_modules/.bin/ng build spotfire-webplayer

title "[spotfire-webplayer] Publish the NPM package to verdaccio:"
(cd dist/spotfire-webplayer ; npm publish --registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general --access public || {
    echo "WARNING: no access to NPM registry - no publishing to artifacts.tibco.com"
})
title "[spotfire-webplayer] Create the NPM package:"
(cd dist/spotfire-webplayer/ ; npm pack)

if [ $aws -eq 0 ]
then
    title "[spotfire-webplayer] Copy the NPM package to S3 bucket:"
    aws s3 cp ${WORKSPACE}/dist/spotfire-webplayer/*.tgz s3://cec-library/spotfire-wrapper.tgz
else
    title "[spotfire-webplayer] Copy the NPM package to local build directory:"
    cp -f ${WORKSPACE}/dist/spotfire-webplayer/*.tgz ${WORKSPACE}/build/spotfire-wrapper.tgz
fi

if [ $aws -eq 0 ]
then
    title "[spotfire-wrapper] Install the NPM package from S3 bucket (used to build the WebElement Library):"
    npm install https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.tgz --no-save
    
else
    title "[spotfire-wrapper] Install the NPM package from NPM registry (or local path if not reachable)."
    echo "The NPM package is used to build the WebElement Library"
    npm install @tibco/spotfire-wrapper --registry http://artifacts.tibco.com:8081/artifactory/api/npm/npm-general --no-save || {
        echo "WARNING: no access to NPM registry - installing from ${WORKSPACE}/build/spotfire-wrapper.tgz"
        npm install ${WORKSPACE}/build/spotfire-wrapper.tgz --no-save
    }
    
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
echo "  - npm install @tibco/spotfire-wrapper --registry http://rcxxxxbld12.na.tibco.com:4873"
echo "  - <script src='https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.js'></script>"
echo ""
echo ""
[ $aws -eq 1 ] && ls -lrt ${WORKSPACE}/build/
echo ""
echo "Done!"

