import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';

import { SpotfireViewerModule } from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<div style='display:flex'>
  <spotfire-viewer style='width:50%; height:600px'
      [url]="url"
      [path]="path"
      [customization]="cust"
      [markingOn]="{ SalesAndMarketing: ['*'] }"
      [maxRows]="10"
      (markingEvent)="onMarking($event)"
      [debug]="true">
  </spotfire-viewer>
  <pre style='font-size:8px'>{{markedData|json}}</pre>
</div>
`})
class AppComponent {
  title = 'demo1';
  url = 'https://spotfire-next.cloud.tibco.com';
  path = 'Samples/Sales and Marketing';
  cust = { showAuthor: true, showFilterPanel: true, showToolBar: true };
  markedData = {};

  // Marking can be subscribed outside component
  onMarking = (e: Event) => {
    console.log('[AppComponent] MARKING MySpot returns', e);
    this.markedData = e;
  }
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [BrowserModule, SpotfireViewerModule],
  declarations: [AppComponent],
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
