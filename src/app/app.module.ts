import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SpotfireWrapperComponent } from './spotfire-wrapper/spotfire-wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule, MatInputModule, MatButtonModule,
  MatSelectModule, MatToolbarModule, MatCheckboxModule
} from '@angular/material';

@NgModule({
  declarations: [SpotfireWrapperComponent],
  imports: [BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, MatSelectModule, MatToolbarModule, MatCheckboxModule,
    MatButtonModule, MatFormFieldModule, MatInputModule],
  entryComponents: [SpotfireWrapperComponent]
})
export class AppModule {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const el = createCustomElement(SpotfireWrapperComponent, { injector: this.injector });
    customElements.define('spotfire-wrapper', el);
  }
}
