#!/bin/sh -e

repl() { printf -- "$1"'%.s' $(eval "echo {1.."$(($2))"}"); }
title() {
    title=$1
    echo ""
    echo ""
    echo "=========================================================================================="
    echo $title
    repl "- " $((${#title}/2+1))
    echo ""
}

rm -rf dist build

title "Install dependencies:"
npm install

title "[spotfire-wrapper] Build the NPM package:"
./node_modules/.bin/ng build spotfire-wrapper --prod
(cd projects/spotfire-wrapper/ ; npm run build --prod )

title "[spotfire-wrapper] Create a tarball for the package:"
(cd build/spotfire-wrapper/ ; npm pack) 
mkdir -p dist
cp -f build/spotfire-wrapper/*.tgz dist/spotfire-wrapper.tgz

title "[spotfire-wrapper-lib] Install the NPM package from dist"
npm install /opt/tibco/users/spotfire-wrapper/dist/spotfire-wrapper.tgz --no-save
    
title "[spotfire-wrapper-lib] Build the WebElement Library:"
npm run build:elements --prod


title "[spotfire-wrapper-lib] Test Schematics "
(cd /tmp ; 
\rm -rf testapp ; 
ng new testapp --minimal --defaults ; 
cd testapp ; 
npm install @angular/cdk@10 ; 
ng add @tibco/spotfire-wrapper@latest )


echo ""
echo "That's all folks!"
exit 0
