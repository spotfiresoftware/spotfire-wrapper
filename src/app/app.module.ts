import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SpotfireWrapperComponent } from './spotfire-wrapper/spotfire-wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule, MatInputModule, MatButtonModule,
  MatSelectModule, MatToolbarModule, MatCheckboxModule
} from '@angular/material';
import { LocalStorageModule } from 'angular-2-local-storage';

const matModules = [MatSelectModule, MatToolbarModule, MatCheckboxModule,
  MatButtonModule, MatFormFieldModule, MatInputModule];
@NgModule({
  declarations: [SpotfireWrapperComponent],
  imports: [BrowserModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule,
    matModules,
    LocalStorageModule.withConfig({
      prefix: 'sw', // stands for Spotfire Wrapper
      storageType: 'localStorage'
    })],
  entryComponents: [SpotfireWrapperComponent]
})
export class AppModule {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const el = createCustomElement(SpotfireWrapperComponent, { injector: this.injector });
    customElements.define('spotfire-wrapper', el);
  }
}
