# Spotfire-Wrapper

This is the home for the __Spotfire Wrapper Library__ and the __Spotfire Wrapper Package__.

> ### Note:
> Library is published to a S3 AWS server, NPM package to a tibco private NPM repository (http://rcxxxxbld12.na.tibco.com:4873)


## Spotfire Wrapper Library

Spotfire Wrapper is a Javascript library that defines two new HTML elements to easily display a Spotfire dashboard in a standard HTML page:

 * `<spotfire-viewer>` to only display a Spotfire dashboard:
```html
<html>
    <head>
        <script src="https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.js"></script>
    </head>
    <body>
        <spotfire-viewer 
            url="https://spotfire-next.cloud.tibco.com" 
            path="Samples/Introduction to Spotfire"
            page="Example dashboard">
        </spotfire-viewer>
    </body>
</html>    
```

 * `<spotfire-editor>` to display and edit settings of a Spotfire dashboard:
```html
<html>
    <head>
        <script src="https://s3-us-west-2.amazonaws.com/cec-library/spotfire-wrapper.js"></script>
    </head>
    <body>
        <spotfire-editor 
            url="https://spotfire-next.cloud.tibco.com" 
            path="Samples/Introduction to Spotfire"
            page="Example dashboard">
        </spotfire-editor>
    </body>
</html>    
```


## Spotfire Wrapper Package

Spotfire Webplayer is an Angular Component built for and with Angular.

### Installation:
```
$ npm install @tibco/spotfire-wrapper --registry http://rcxxxxbld12.na.tibco.com:4873
$ npm install @angular/cdk @angular/material @angular/flex-layout
```

The package provides two modules with a component each :
 * `SpotfireViewerModule` exports `SpotfireViewerComponent`
 * `SpotfireEditorModule` depends on `SpotfireViewerModule` and exports `SpotfireEditorComponent`


For exemple, user can extend `SpotfireViewerComponent` like this : 

```typescript
import { SpotfireModuleComponent, SpotfireViewerComponent} from '@tibco/spotfire-wrapper`;

@Component({
  selector: 'my-spotfire',
  template: `Override spotfire-viewer template:
  <button *ngFor="let p of ['Sales performance', 'Territory analysis', 'Effect of promotions']" (click)="openPage(p)">{{p}}</button>
  <div class="mys" #spot></div>`,
  styles: [`
  div.mys { width:600px; height:400px; background:#ebebeb; border-radius: 20px}
  button { padding:10px }
`]
})
class MySpotfireViewerComponent extends SpotfireViewerComponent implements OnInit {
  // No var please (or set a contructor)
  ngOnInit(): void {
    this.url = 'https://spotfire-next.cloud.tibco.com';
    this.path = 'Samples/Sales and Marketing';
    this.customization = { showAuthor: true, showFilterPanel: true, showToolBar: true } as SpotfireCustomization;
    this.markingOn = '{"SalesAndMarketing": ["*"]}';

    // Show default page:
    this.display();

    // Subscribe to markingEvent
    //
    this.markingEvent.subscribe(e => console.log('MARKING MySpot', e));
  }
}
```


Run `ng serve --port=4204` for a dev server. Navigate to `http://localhost:4204/`. The app will automatically reload if you change any of the source files.

## Build: Step #1 the NPM package 

```sh
$ npm install
$ ng build spotfire-webplayer
$ (cd dist/spotfire-webplayer/ ; npm pack)
$ mkdir build
$ cp -f dist/spotfire-webplayer/spotfire-webplayer-0.0.1.tgz build/spotfire-wrapper.tgz
```

## Build: Step #2 the library
```sh
$ npm install build//spotfire-wrapper.tgz
$ npm run build:elements
$ cp -f elements/spotfire-wrapper.js ./build
```


The script `build.sh` does all the steps above and publish the artefacts to S3 bucket https://s3-us-west-2.amazonaws.com/cec-library/

## Demo #1: Use spotfire-wrapper library in a raw HTML code

After building the JS library (step above), run `cd demo` and `cp ../build/spotfire-wrapper.js .`

Start a HTTP server : 
> `python -m SimpleHTTPServer 4404` 

and navigale to `http://localhost:4404`, to see how to easily display a Spotfire dashboard in raw html pages.

## Demo #2: Use spotfire-wrapper package inside an Angular application

To see how to include the AngularElement <spotfire-wrapper> inside another Angluar application (called here `container`):
Run:
> `ng serve container --port=4205 --open`

It will open a browser to the container app (`http://localhost:4205/`).

> Note: 
> 
> The container code has been extremely simplified. Check the src_container/main.ts file

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

Use Slack or email to send me any question or concern you have 

Nicolas Deroche - part of **The Tibco Company**