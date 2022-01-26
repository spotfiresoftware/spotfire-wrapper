/*
* Copyright (c) 2019-2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { SpotfireDocument, SpotfireViewerModule } from '@tibcosoftware/spotfire-wrapper';

const WONDERS = ['Great Pyramid of Giza', 'Hanging Gardens of Babylon',
  'Temple of Artemis at Ephesus', 'Statue of Zeus at Olympia', 'My Marvellous Spotfire Dashboard',
  'Mausoleum at Halicarnassus', 'Colossus of Rhodes', 'Lighthouse of Alexandria'];

@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<button [disabled]="!document" (click)="getProperties()">getProperties()</button>
<button [disabled]="!properties" (click)="setProperty()">Set a random description property</button>

<div style='display:flex; height: 400px;'>
  <spotfire-viewer [url]="url" [path]="path" (document)="document = $event" [debug]="true" style='flex:1 1 0%'></spotfire-viewer>
  <pre style='flex:1 1 0%; border-right:1px solid #bbb; padding:5px; font-size:10px'>
    <code>Properties</code>={{properties|json}}
  </pre>
</div>
`
})
class AppComponent {
  title = 'demo3';
  url = 'https://spotfire-next.cloud.tibco.com';
  path = 'Samples/Sales and Marketing';
  document: SpotfireDocument = null;
  properties: {};

  getProperties = () => this.document.getDocumentProperties$().subscribe(s => this.properties = s);

  setProperty = () => {
    this.document.setDocumentProperty('Description', WONDERS[Math.floor(Math.random() * 8)]);
    this.document.getDocumentProperty$('Description').subscribe(w => console.log('Description contains', w));
    // refresh properties
    this.getProperties();
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
