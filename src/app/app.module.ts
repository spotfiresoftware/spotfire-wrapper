import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SpotfireWrapperComponent } from './spotfire-wrapper/spotfire-wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule, MatInputModule, MatButtonModule,
  MatSelectModule, MatCheckboxModule
} from '@angular/material';

const matModules = [MatSelectModule, MatCheckboxModule,
  MatButtonModule, MatFormFieldModule, MatInputModule];
@NgModule({
  declarations: [SpotfireWrapperComponent],
  imports: [BrowserModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule,
    matModules],
  entryComponents: [SpotfireWrapperComponent]
})
export class AppModule {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const el = createCustomElement(SpotfireWrapperComponent, { injector: this.injector });
    customElements.define('spotfire-wrapper', el);
  }
}
