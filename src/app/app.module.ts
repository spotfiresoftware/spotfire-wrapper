import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { SpotfireWrapperComponent } from './spotfire-wrapper/spotfire-wrapper.component';

@NgModule({
  declarations: [SpotfireWrapperComponent],
  imports: [BrowserModule],
  entryComponents: [SpotfireWrapperComponent]
})
export class AppModule {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const el = createCustomElement(SpotfireWrapperComponent, { injector: this.injector });
    customElements.define('spotfire-wrapper', el);
  }
}
