import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SpotfireWebplayerComponent } from 'projects/spotfire-webplayer/src/public_api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule, MatInputModule, MatButtonModule,
  MatSelectModule, MatCheckboxModule
} from '@angular/material';

const matModules = [MatSelectModule, MatCheckboxModule,
  MatButtonModule, MatFormFieldModule, MatInputModule];
@NgModule({
  declarations: [SpotfireWebplayerComponent],
  imports: [BrowserModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule, matModules],
  entryComponents: [SpotfireWebplayerComponent]
})
export class AppModule {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const el = createCustomElement(SpotfireWebplayerComponent, { injector: this.injector });
    customElements.define('spotfire-wrapper', el);
  }
}
