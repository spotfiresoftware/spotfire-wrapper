/*
* Copyright (c) 2019-2021. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// import { SpotfireEditorComponent, SpotfireEditorModule } from '@tibcosoftware/spotfire-wrapper';
import { SpotfireViewerComponent, SpotfireViewerModule } from '@tibcosoftware/spotfire-wrapper';

@NgModule({
  imports: [BrowserModule, NoopAnimationsModule, SpotfireViewerModule]
})
export class AppModule implements DoBootstrap {
  constructor(private i: Injector) { }
  ngDoBootstrap() {
    customElements.define('spotfire-viewer', createCustomElement(SpotfireViewerComponent, { injector: this.i }));
    // To reduce footprint of the library remove the support of <spotfire-editor>
    //  customElements.define('spotfire-editor', createCustomElement(SpotfireEditorComponent, { injector: this.i }));
  }
}
