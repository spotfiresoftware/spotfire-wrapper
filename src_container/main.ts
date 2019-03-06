import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<h2>Angular app "{{title|uppercase}}"</h2>
  <p>
  Below, we use the <code>&lt;spotfire-wrapper&gt;</code> tag which is an AngularElement
  defined in the external javascript library
  <code>spotfire-library.js</code> loaded by index.html:</p>
  <spotfire-wrapper url="" path="" page=""></spotfire-wrapper>
`})
class AppComponent {
  title = 'container';
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent]
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
