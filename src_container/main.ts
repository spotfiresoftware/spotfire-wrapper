import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';

import { SpotfireViewerComponent } from '@tibco/spotfire-wrapper';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'my-spotfire',
  template: `Override spotfire-wrapper template :
  <button *ngFor="let p of ['Sales performance', 'Territory analysis', 'Effect of promotions']" (click)="openPage(p)">{{p}}</button>
  <div class="mys" #spot></div>`,
  styles: [`
  div.mys { width:100%; height:600px; background:#ebebeb; border-radius: 20px}
  button { padding:10px }
`]
})
class MySpotfireWrapperComponent extends SpotfireViewerComponent implements OnInit {
  // No var please (or set a contructor)
  ngOnInit(): void {
    // Url and customization have been initialized when using <my-spotfire> but may be set here,
    // just like path, markingOn, ... are:
    this.path = 'Samples/Sales and Marketing';

    // Marking can detail list of tables and their columns or '*' for all tables.
    // When tables names are specified, user can detail list of columns to retrieve or all with '*'
    this.markingOn = { SalesAndMarketing: ['*'] };
    this.maxRows = 12;

    // Marking is subscribed twice. Here and in AppComponent thru (markingEvent) on <my-spotfire> call
    //
    this.markingEvent.subscribe(e => console.log('[MySpotfireWrapperComponent] MARKING MySpot returns', e));

    // show default page:
    this.display();
  }
}

@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<div style='display:flex'>
  <my-spotfire  style='width:50%'
      [url]="url" [customization]="cust"
      (markingEvent)="onMarking($event)"
      [debug]="true">
  </my-spotfire>
  <pre style='font-size:8px'>{{markedData|json}}</pre>
</div>
`})
class AppComponent {
  url = 'https://spotfire-next.cloud.tibco.com';
  cust = { showAuthor: true, showFilterPanel: true, showToolBar: true };

  title = 'container';
  markedData = {};

  // Marking can be subscribed outside component
  onMarking = (e: Event) => {
    console.log('[AppComponent] MARKING MySpot returns', e);
    this.markedData = e;
  }
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, MySpotfireWrapperComponent],
  entryComponents: [MySpotfireWrapperComponent]
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
