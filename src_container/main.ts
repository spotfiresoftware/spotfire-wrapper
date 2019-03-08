import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<p> {{url}} et {{path}}
  Below, we use the <code>&lt;spotfire-wrapper&gt;</code> tag which is an AngularElement
  defined in the external javascript library <code>spotfire-library.js</code> loaded by index.html:
</p>
<spotfire-wrapper
  [url]="url"
  [path]="path"
  [page]="page"
  [maxRows]="24"
  [customization]="cust"
  [markingOn]="mon"
  (markingEvent)="onMarking($event)">
</spotfire-wrapper>
<pre>{{markedData|json}}</pre>
`})
class AppComponent {
  url = 'https://spotfire-next.cloud.tibco.com';
  path = 'Samples/Sales and Marketing';
  page = 'Territory analysis';
  cust = { showAuthor: true, showFilterPanel: true, showToolBar: true };
  mon = { SalesAndMarketing: ['*'] };
  title = 'container';
  markedData = {};

  onMarking = (e: Event) => {
    console.log('[SRC_CONTAINER] onMarking returns', e);
    this.markedData = e['detail'];
  }
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