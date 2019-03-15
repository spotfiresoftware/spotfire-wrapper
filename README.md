# Spotfire-Wrapper

This is the home for the __Spotfire Wrapper Library__ and the __Spotfire Webplayer Component__.

> ### Note:
> Artefacts are published on a S3 AWS server.


## Spotfire Wrapper Library

Spotfire Wrapper is a Javascript library that defines a new HTML element to easily display a Spotfire dashboard in a standard HTML page.


```html
<html>
    <head>
        <script src="https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.js"></script>
    </head>
    <body>
        <spotfire-wrapper 
            url="https://spotfire-next.cloud.tibco.com" 
            path="Samples/Introduction to Spotfire"
            page="Example dashboard">
        </spotfire-wrapper>
    </body>
</html>    
```



## Spotfire Webplayer Component

Spotfire Webplayer is an Angular Component built for and With Angular.

### Installation:
```
$ npm install https://s3-us-west-2.amazonaws.com/cec-library/spotfire-webplayer-0.0.1.tgz
$ npm install @angular/cdk @angular/material @angular/flex-layout
```

User needs to add  
 - A NPM package `spotfire-webplayer-X.Y.Z.tgz` used  is a NPM package that can be used in conjonction with an Angular Applicaiti

 - A JavaScript library  a library `spotfire-wrapper.js` that will add new HTML tag `<spotfire-wrapper>` to embed a Spotfire dashboard

Run `ng serve --port=4204` for a dev server. Navigate to `http://localhost:4204/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build:elements` to build the single js that will need to be moved to a remote server (ex: https://s3-us-west-2.amazonaws.com/cec-library/)

## Demo

After building the JS library (step above), run `cd demo` and `cp ../elements/spotfire-wrapper.js .`

Start a HTTP server : 
> `python -m SimpleHTTPServer 4404` 

and navigale to `http://localhost:4404`, to see how to easily display a Spotfire dashboard in raw html pages.

## Use inside an other Angular app:
To see how to include the AngularElement <spotfire-wrapper> inside another Angluar application (called here `container`):
Run:
> `ng serve container --port=4205 --open`

It will open a browser to the container app (`http://localhost:4205/`).

Note: the container code has been extremely simplified. Check the src_container/main.ts file

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

Use Slack or email to send me any question or concern you have 

Nicolas Deroche - part of **The Great Tibco Company**