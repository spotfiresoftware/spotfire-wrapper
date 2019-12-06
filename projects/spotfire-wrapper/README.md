# Wrapper for TIBCO Spotfire(R)

This is the home for the __Wrapper for TIBCO Spotfire(R)__ package.

Wrapper for TIBCO Spotfire(R) is an Angular Component built for and with Angular 8+.

## Install Wrapper for TIBCO Spotfire(R):

Use the Angular CLI's install schematic to add Wrapper for TIBCO Spotfire(R) to your project by running the following command:
```bash
ng add @tibco/spotfire-wrapper
```

__Then it's really easy to get started !__

## Dashboard schematics 

Running the dashboard schematic generates a new SpotfireDashboard component that can be used and modified to display a dashboard of your Spotfire(R):

```
ng generate @tibco/spotfire-wrapper:dashboard --name MySpot
```

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


The package provides two modules and two components:
 * `SpotfireViewerModule` exports `SpotfireViewerComponent`
 * `SpotfireEditorModule` depends on `SpotfireViewerModule` and exports `SpotfireEditorComponent`



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

and use your new directove <mu-spotfire><my-spotifire>` in your templates

## Demos

Take a look at examples at 
 - https://github.com/TIBCOSoftware/spotfire-wrapper/demo
 - https://github.com/TIBCOSoftware/spotfire-wrapper/demo1
 - https://github.com/TIBCOSoftware/spotfire-wrapper/demo2


---

