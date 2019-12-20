# Wrapper for TIBCO Spotfire(R)

This is the home for the __Wrapper for TIBCO Spotfire(R)__ library and package.

> ### Notes:
> * Library can be found here: https://github.com/TIBCOSoftware/spotfire-wrapper/blob/master/dist/spotfire-wrapper.js
> * NPM package can be found here: http://npmjs.com/packages/spotfire-wrapper


## Wrapper for TIBCO Spotfire(R)  -  the Javascript library

Wrapper for TIBCO Spotfire(R) provides a Javascript library that defines a new HTML tag to easily display a Spotfire dashboard in a standard HTML page : `<spotfire-viewer>`:
```html
<html>
    <head>
        <script src="https://github.com/TIBCOSoftware/spotfire-wrapper/blob/master/dist/spotfire-wrapper.js"></script>
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


## Wrapper for TIBCO Spotfire(R) - the npm package

Wrapper for TIBCO Spotfire(R) is also an Angular Component built for and with Angular 8+.

### Installation using schematics:

```
$ ng add @tibco/spotfire-wrapper
$ ng generate @tibco/spotfire-wrapper:dashboard --name MySpot
```

Then add `MySpotComponent` to `declarations` array of your `@ngModule`, and use `<myspot></myspot>` in your html templates.
You can them edit the `src/myspot.component.ts` as you wish.

### Installation with `npm install`:
```
$ npm install @tibco/spotfire-wrapper
$ npm install @angular/cdk @angular/material @angular/flex-layout
```

The package provides two modules with a component each :
 * `SpotfireViewerModule` exports `SpotfireViewerComponent`
 * `SpotfireEditorModule` depends on `SpotfireViewerModule` and exports `SpotfireEditorComponent`


For example, user can extend `SpotfireViewerComponent` like this : 

```typescript
import { OnInit, Component } from '@angular/core';
import { SpotfireViewerComponent, SpotfireCustomization } from '@tibco/spotfire-wrapper';

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
export class MySpotfireViewerComponent extends SpotfireViewerComponent implements OnInit {
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

---

## Demos
### Demo #0: Use &lt;spotfire-viewer> in a raw HTML code:

After building the JS library (step below), run `cd demo` and `cp ../build/spotfire-wrapper.js .`

Start a HTTP server : 
```bash
python -m SimpleHTTPServer 4404
``` 
or 
```bash
python3 -m http.server 4404
```

and navigate to `http://localhost:4404`, to see how to easily display a Spotfire dashboard in raw html pages.

### Demo #1: Use &lt;spotfire-viewer> tag inside an Angular application:

```bash
ng serve demo1 --port=4205 --open
```

It will open a browser `http://localhost:4205`.

Sources are available in `demo1` directory.

### Demo #2: Extend SpotfireViewerComponent inside an Angular application:

```bash
ng serve demo2 --port=4206 --open
```

It will open a browser `http://localhost:4206`.

Sources are available in `demo2` directory.

> Note: 
> 
> The code of demo1 and demo2 has been extremely simplified. Check the `demo1/main.ts` and `demo2/main.ts` files.

---

## Builds

### Step #1: build the NPM package:

```bash
$ npm install
$ ng build spotfire-wrapper
$ (cd build/spotfire-wrapper/ ; npm pack)
$ mkdir build
$ cp -f build/spotfire-wrapper/spotfire-wrapper-X.Y.Z.tgz dist/spotfire-wrapper.tgz
```

### Step #2: build the Javascript library:
```bash
$ npm install build//spotfire-wrapper.tgz
$ npm run build:elements
$ cp -f elements/spotfire-wrapper.js ./build
```

---

# License

  Copyright &copy; 2019. TIBCO Software Inc.

  This file is subject to the license terms contained
  in the license file that is distributed with this file.

  Please see LICENSE for details of license and dependent third party components referenced by this library, or it can be found here:
                                                                                                                                                                                                                                                                                      
https://github.com/TIBCOSoftware/spotfire-wrapper/blob/master/LICENSE
