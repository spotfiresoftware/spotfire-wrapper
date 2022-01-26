/*
* Copyright (c) 2019-2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { Component, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { SpotfireDocument, SpotfireFiltering, SpotfireReporting, SpotfireServer, SpotfireViewerModule } from '@tibcosoftware/spotfire-wrapper';

@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<div *ngIf='spotfireServer'>
<span class='redDot' *ngIf='!spotfireServerStatus'></span>
<span class='greenDot' *ngIf='spotfireServerStatus'></span>
  {{spotfireServer}}
  <div *ngIf='!spotfireServerStatus'>{{spotfireServerStatusMessage}}</div>
</div>
<button mat-stroked-button color="primary" (click)="toggleFullsize()">FullSize</button>
<button mat-stroked-button color="primary" (click)="setFilters()">Change filters</button>
<button mat-stroked-button color="primary" (click)="switchPath()">Change path</button>
{{path}}
<button mat-stroked-button color="primary" (click)="switchParam()">Change param</button>  
{{param}}
<div *ngIf="reporting">
  <button mat-stroked-button color="primary" (click)="doPrint()">Print...</button>
  <button mat-stroked-button color="primary" (click)="doPdf()">Export to PDF...</button>
  <button mat-stroked-button color="primary" (click)="doImage()">Save as Image</button>
</div>
<button mat-stroked-button color="primary" (click)="debug=!debug">DEBUG={{debug}}</button>
<div *ngIf="filtering">
  <button mat-stroked-button color="primary" (click)="doFilteringSchemes()">get Filtering Schemes</button>
</div>
<h1>{{filterNames[b]}}</h1>
<div style='display:flex'>
  <spotfire-viewer [class.normsize]="!fullsize" [class.fullsize]="fullsize"
      [url]="url"
      [path]="path"
      [version]="version"
      [customization]="cust"
      [markingOn]="{ SalesAndMarketing: ['*'] }"
      [maxRows]="10"
      (markingEvent)="onMarking($event)"
      (reportingEvent)="onReporting($event)"
      (filteringEvent)="onFiltering($event)"
      (filtering)="filtering = $event"
      [filters]='filters'
      (document)="setDocument($event)"
      [parameters]="param"
      [debug]="debug">
    </spotfire-viewer>
    <pre style='border-right:1px solid #bbb; padding:5px; font-size:10px'>what we send to <code>filter</code>={{filtersOut|json}}</pre>
    <pre style='font-size:10px;  padding:5px;'>what we mark ({{buffersize}} o): {{markedData|json}}</pre>
  </div>
  <pre style='border-right:1px solid #bbb; padding:5px; font-size:10px'>FilteringSchemes={{schemesOut|json}}</pre>
`, styles: [`
.normsize { width:50%; height:600px}
.fullsize { position: absolute; top: 60px; left:0; right:0; bottom:0; width:100%; height:100%}
.redDot {
  height: 15px;
  width: 15px;
  background-color: #ff0000;
  border-radius: 50%;
  display: inline-block;
}
.greenDot {
  height: 15px;
  width: 15px;
  background-color: #33cc33;
  border-radius: 50%;
  display: inline-block;
}`]
})
class AppComponent {
  title = 'demo1';
  url = 'https://spotfire-next.cloud.tibco.com';
  path = 'Samples/Expense Analyzer Dashboard'; // 'Samples/Sales and Marketing';
  // Example: Specify a specific version for the JavaScript API or leave it out to use the default.
  // version = '10.10';
  version = '7.14';
  cust = { showAuthor: true, showFilterPanel: true, showToolBar: true };
  markedData = {};
  param = 'ApplyBookmark(bookmarkName="Book2");';
  filterNames = ['No filters', 'Florida', 'Colorado', 'Arizona'];
  b = 0;
  buffersize = 0;
  filters: any = null;
  fullsize = false;
  debug = false;
  reporting: SpotfireReporting = null;
  filtering: SpotfireFiltering = null;
  filters1 = [
    { dataTableName: 'SalesAndMarketing', dataColumnName: 'State', filterSettings: { values: ['Florida'] } },
    { dataTableName: 'SalesAndMarketing', dataColumnName: 'City', filterSettings: { values: ['Fort Lauderdale'] } },
    { dataTableName: 'SalesAndMarketing', dataColumnName: 'BCG segmentation', filterSettings: { values: ['Dogs', 'Stars'] } },
    { dataTableName: 'SalesAndMarketing', dataColumnName: 'Class Sales', filterSettings: { highValue: '123', lowValue: '67' } }
  ];
  filters2 = [
    { dataTableName: 'SalesAndMarketing', dataColumnName: 'State', filterSettings: { values: ['Colorado'] } },
    { dataTableName: 'SalesAndMarketing', dataColumnName: 'Class Sales', filterSettings: { highValue: '60', lowValue: '10' } }
  ];
  // filters3 = [{ dataTableName: 'SalesAndMarketing', dataColumnName: 'State', filterSettings: { values: ['Arizona'] } }];
  filters3 = '[{"dataTableName":"SalesAndMarketing","dataColumnName":"State","filterSettings":{"values":["Arizona"]}}]';

  filtersOut = {};
  schemesOut = {};
  spotfireServer = '';
  spotfireServerStatus: boolean;
  spotfireServerStatusMessage = '';
  doc: SpotfireDocument;

  // Marking can be subscribed outside component
  onMarking = (e: Event) => {
    console.log('[AppComponent] onMarking', e);
    this.buffersize = JSON.stringify(e).length;
    this.markedData = e;
  };
  switchPath = () => {
    this.path = this.path === 'Samples/Sales and Marketing' ?
      'Samples/Expense Analyzer Dashboard' : 'Samples/Sales and Marketing';
  };
  switchParam = () =>
    this.param = this.param.includes('Book2') ? 'ApplyBookmark(bookmarkName="Book1");' : 'ApplyBookmark(bookmarkName="Book2");'
  setFilters = () => {
    this.b = (this.b + 1) % 4;
    // this.b = this.b === 3 ? 1 : this.b + 1;
    switch (this.b) {
      case 0: this.filters = null; break;
      case 1: this.filters = this.filters1; break;
      case 2: this.filters = this.filters2; break;
      case 3: this.filters = this.filters3; break;
    }
    //    this.filters = this.b === 1 ? [] : (this.b === 2 ? this.filters1 : this.filters2);
    console.log('[AppComponent] set params to', this.b, this.filters);
  };
  setDocument = (e) => {
    console.log('[AppComponent] setDocument', e);
    this.doc = e;
  };
  onReporting = (e: SpotfireReporting) => {
    console.log('[AppComponent] onReporting', e);
    this.reporting = e;
  };
  onFiltering = (e: Event) => {
    console.log('[AppComponent] onFiltering', e);
    this.filtersOut = e;
  };
  onServerStatus = (e: SpotfireServer) => {
    console.log('[AppComponent] onServerStatus', e);
    this.spotfireServer = e.serverUrl;
    this.spotfireServerStatus = e.isOnline;
    this.spotfireServerStatusMessage = e.statusMessage;
  };
  doPdf = () => {
    console.log('doPdf', this.reporting);
    this.reporting.exportToPdf();
  };
  doPrint = () => {
    console.log('doPrint', this.reporting);
    this.reporting.print();
  };
  doImage = () => {
    console.log('doImage', this.reporting);
    this.reporting.exportActiveVisualAsImage();
  };

  doFilteringSchemes = () =>
    this.filtering.getFilteringSchemes$().subscribe(s => {
      console.log('doFilteringSchemes', s);
      this.schemesOut = s;
    });

  toggleFullsize = () => this.fullsize = !this.fullsize;
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [BrowserModule, SpotfireViewerModule, MatButtonModule],
  declarations: [AppComponent]
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
