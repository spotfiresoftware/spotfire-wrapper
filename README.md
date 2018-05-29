# Spotfire-wrapper

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.0.

## Development server

Run `ng serve --port=4204` for a dev server. Navigate to `http://localhost:4204/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build:elements` to build the single js that will need to be moved to a remote server (ex: https://s3-us-west-2.amazonaws.com/cec-library/)

## Demo

After building the JS library (step above), run `cd demo` and `cp ../elements/spotfire-wrapper.js .`


Start a HTTP server : `python -m SimpleHTTPServer 4404` and navigale to `http://localhost:4404`, to see how to easily display a Spotfire dashboard

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).