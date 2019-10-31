/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SpotfireEditorModule, SpotfireViewerComponent, SpotfireEditorComponent } from '@tibco/spotfire-wrapper';

@NgModule({
  imports: [BrowserModule, NoopAnimationsModule, SpotfireEditorModule]
})
export class AppModule {
  constructor(private i: Injector) { }
  ngDoBootstrap() {
    customElements.define('spotfire-viewer', createCustomElement(SpotfireViewerComponent, { injector: this.i }));
    customElements.define('spotfire-editor', createCustomElement(SpotfireEditorComponent, { injector: this.i }));
  }
}
