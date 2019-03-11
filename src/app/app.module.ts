import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {
  SpotfireWebplayerModule,
  SpotfireWrapperComponent as SwComp,
  SpotfireWebplayerComponent as SpComp
} from 'spotfire-webplayer';

@NgModule({ imports: [BrowserModule, NoopAnimationsModule, SpotfireWebplayerModule] })
export class AppModule {
  constructor(private i: Injector) { }
  ngDoBootstrap() {
    customElements.define('spotfire-wrapper', createCustomElement(SwComp, { injector: this.i }));
    customElements.define('spotfire-webplayer', createCustomElement(SpComp, { injector: this.i }));
  }
}
