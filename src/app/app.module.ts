/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// import { SpotfireEditorComponent, SpotfireEditorModule } from '@tibco/spotfire-wrapper';
import { SpotfireViewerComponent } from '@tibco/spotfire-wrapper';

@NgModule({
  imports: [BrowserModule, NoopAnimationsModule/* , SpotfireEditorModule */]
})
export class AppModule {
  constructor(private i: Injector) { }
  ngDoBootstrap() {
    customElements.define('spotfire-viewer', createCustomElement(SpotfireViewerComponent, { injector: this.i }));
    // To reduce footprint of the library remove the support of <spotfire-editor>
    //  customElements.define('spotfire-editor', createCustomElement(SpotfireEditorComponent, { injector: this.i }));
  }
}
