/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';

import { SpotfireViewerModule } from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<button (click)="doIt()">DOIT</button>
PARAM = {{param}}
<div style='display:flex'>
  <spotfire-viewer style='width:50%; height:600px'
      [url]="url"
      [path]="path"
      [customization]="cust"
      [markingOn]="{ SalesAndMarketing: ['*'] }"
      [maxRows]="10"
      (markingEvent)="onMarking($event)"
      [parameters]="param"
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
  param = 'ApplyBookmark(bookmarkName="Book2");';

  // Marking can be subscribed outside component
  onMarking = (e: Event) => {
    console.log('[AppComponent] MARKING MySpot returns', e);
    this.markedData = e;
  }
  doIt = (t) => {
    console.log('Change param');
    this.param = this.param === 'ApplyBookmark(bookmarkName="Book1");' ?
      'ApplyBookmark(bookmarkName="Book2");' :
      'ApplyBookmark(bookmarkName="Book1");';
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
