/*
* Copyright (c) 2019-2021. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import {Component, NgModule, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {SpotfireDocument, SpotfireViewerComponent, SpotfireViewerModule} from '@tibcosoftware/spotfire-wrapper';

@Component({
    selector: 'app-root',
    template: `
        <h2>Angular app "{{title|uppercase}}"</h2>

        <button mat-stroked-button color="primary" (click)="debug=!debug">DEBUG={{debug}}</button>
        <span>Active Page = {{activePage}}</span>
        <div style='display:flex; flex-direction: row; width: 100%'>
            <h3 style="width: 50%">Main Report:</h3>
            <h3 style="width: 50%">Second Report:</h3>
        </div>
        <div style='display:flex; flex-direction: row; width: 100%'>
            <spotfire-viewer style="width: 50%; height:600px" #sfViewer
                             [url]="url"
                             [path]="path"
                             [page]="'Configuring a treemap'"
                             [version]="version"
                             [markingOn]="'*'"
                             (markingEvent)="onMarking($event)"
                             [linkedReportIds]="['secondReport']"
                             (document)="setDocument($event)"
                             [debug]="debug">
            </spotfire-viewer>
            <div id="secondReport" style="width: 50%"></div>
        </div>`
})
class AppComponent {
    @ViewChild('sfViewer', {static: false}) sfViewer: SpotfireViewerComponent;

    title = 'Demo Linked Reports';
    url = 'https://spotfire-next.cloud.tibco.com';
    path = 'Samples/Configuring Advanced Visualizations';
    // Example: Specify a specific version for the JavaScript API or leave it out to use the default.
    version = '10.10';
    debug = true;
    activePage = '';

    markedData = {};
    buffersize = 0;

    private doc: SpotfireDocument;

    // Marking can be subscribed outside component
    onMarking = (e: Event) => {
        // console.log('[AppComponent] onMarking', e);
        this.buffersize = JSON.stringify(e).length;
        this.markedData = e;
    };
    setDocument = (e) => {
        console.log('[AppComponent] setDocument', e);
        if (!this.doc) {
            this.doc = e;
            this.doc.onDocumentReady$().subscribe(p => {
                // this.sfViewer.openPage('Configuring a treemap');
                this.sfViewer.openPage('Configuring a treemap', 'secondReport');
            });
            this.doc.getActivePage$().subscribe(p => {
                this.activePage = 'Main Report';
                console.log('Main active page: ', p);
            });
            this.doc.getActivePage$('secondReport').subscribe(p => {
                this.activePage = 'Second Report';
                console.log('Second Report active page: ', p);
            });
        }
    };
}

@NgModule({
    bootstrap: [AppComponent],
    imports: [BrowserModule, SpotfireViewerModule, MatButtonModule],
    declarations: [AppComponent]
})
class AppModule {
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
