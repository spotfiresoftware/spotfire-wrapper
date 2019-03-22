# Spotfire-Wrapper

This is the home for the __Spotfire Wrapper Package__.
Spotfire Webplayer is an Angular Component built for and with Angular.

### Installation:
```bash
$ npm install @tibco/spotfire-wrapper --registry http://rcxxxxbld12.na.tibco.com:4873
$ npm install @angular/cdk @angular/material @angular/flex-layout
```

The package provides two modules with a component each :
 * `SpotfireViewerModule` exports `SpotfireViewerComponent`
 * `SpotfireEditorModule` depends on `SpotfireViewerModule` and exports `SpotfireEditorComponent`


For exemple, user can extend `SpotfireViewerComponent` like this : 

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

## Demo: Use spotfire-wrapper package inside an Angular application

To see how to user the Spotfire Component inside another Angluar application (called here `demo1`):
Run:
```bash
ng serve demo1 --port=4205 --open
```

It will open a browser to the demo1 app (`http://localhost:4205/`).

> Note: 
> 
> The demo1 code has been extremely simplified. Check the demo1/main.ts file

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

Use Slack or email to send me any question or concern you have 

Nicolas Deroche - part of **The Tibco Company**