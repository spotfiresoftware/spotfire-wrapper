# Wrapper for TIBCO Spotfire(R) - the Angular package

This is the home for the __Wrapper for TIBCO Spotfire(R)__ Angular package.


Wrapper for TIBCO Spotfire(R) is an Angular Component built for and with Angular 8+.

> ### Notes:
> * NPM package can be found here: https://www.npmjs.com/package/@tibco/spotfire-wrapper
> * Visit [JS library README](../../README.md) to read more about the JS alternate way.


## [Optional] Create a Angular App if you don't already have one:
```bash
ng new myapp
cd myapp
npm install @angular/cdk
```

Two ways to install the NPM package:
## 1 - Install Wrapper for TIBCO Spotfire(R) using Schematics:

Use the Angular CLI's to install schematic to add Wrapper for TIBCO Spotfire(R) to your project by running the following command:
```bash
ng add @tibco/spotfire-wrapper
```

## 2 - Install Wrapper for TIBCO Spotfire(R) with `npm install`:
```
npm install @tibco/spotfire-wrapper
npm install @angular/cdk @angular/material @angular/flex-layout
```

__Then it's really easy to get started !__


## Create a dashboard using schematics 

Running the dashboard schematic generates a new SpotfireDashboard component that can be used and modified to display a dashboard of your Spotfire(R):

```
ng generate @tibco/spotfire-wrapper:dashboard --name MySpot
```

Next, you will add `MySpotViewerComponent` to the array "`declarations`" of your angular modules, and use `<my-spot></my-spot>` in an HTML template of one of component declared in this module.

A Spotfire dashboard will be displayed!

Have a look at `src/app/my-spot.component.ts` file to see dashboard settings...

## Run the server:

Run `ng serve --port=4204` for a dev server. Navigate to `http://localhost:4204/`. The app will automatically reload if you change any of the source files.


## Create your own component

You may also want to create your own component:

```typescript
import { BrowserModule        } from '@angular/platform-browser';
import { NgModule, Component  } from '@angular/core';
import { SpotfireViewerModule } from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-root',
  styles: [` spotfire-viewer { height: 300px; }`],
  template: `
  <spotfire-viewer
      [url]="url"
      [path]="path"
      [customization]="cust"
      [markingOn]="mon"
      [maxRows]="15"
      (markingEvent)="onMarking($event)">
  </spotfire-viewer>`
})
export class AppComponent {
  url       = 'https://spotfire-next.cloud.tibco.com';
  path      = 'Samples/Sales and Marketing';
  cust      = { showAuthor: true, showFilterPanel: true, showToolBar: true };
  mon       = { SalesAndMarketing: ['*'] };
  onMarking = (e: Event) => console.log('[AppComponent] MARKING returns', e);
}

@NgModule({
  imports:      [ BrowserModule, SpotfireViewerModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule {}
```


## Extend SpotfireViewerComponent component

You can also extend `SpotfireViewerComponent` like this : 

```typescript
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
  // No var please (or set a constructor)
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

and use your new directove <my-spotfire><my-spotifire>` in your templates

## Demos


### Demo #1: Use &lt;spotfire-viewer> tag inside an Angular application:

see  https://github.com/TIBCOSoftware/spotfire-wrapper/tree/master/demo1

```bash
ng serve demo1 --port=4205 --open
```

It will open a browser `http://localhost:4205`.

Sources are available in `demo1` directory.

### Demo #2: Extend SpotfireViewerComponent inside an Angular application:

see https://github.com/TIBCOSoftware/spotfire-wrapper/tree/master/demo2

```bash
ng serve demo2 --port=4206 --open
```

It will open a browser `http://localhost:4206`.

Sources are available in `demo2` directory.

> Note: 
> 
> The code of these two demos has been extremely simplified. Check the `demo1/main.ts` and `demo2/main.ts` files.

---


# License

  Copyright &copy; 2019-2020. TIBCO Software Inc.

  This file is subject to the license terms contained
  in the license file that is distributed with this file.

  Please see LICENSE for details of license and dependent third party components referenced by this library, or it can be found here:
                                                                                                                                                                                                                                                                                      
https://github.com/TIBCOSoftware/spotfire-wrapper/blob/master/LICENSE

