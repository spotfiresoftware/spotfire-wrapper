import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';


import { SpotfireViewerComponent } from 'spotfire-webplayer';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'my-spotfire',
  template: `Override spotfire-wrapper template : <div class="mys" #spot></div>`,
  styles: [`div.mys { width:600px; height:400px; background:#ebebeb; border-radius: 20px}`]
})
class MySpotfireWrapperComponent extends SpotfireViewerComponent { }


@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<p> {{url}} et {{path}}
  Below, we use the <code>&lt;spotfire-viewer&gt;</code> and <code>&lt;spotfire-editor&gt;</code> tags which are AngularElement
  defined in the external javascript library <code>spotfire-library.js</code> loaded by index.html:
</p>
<h1>Default Template:</h1>
<label>
  Page:
  <select [formControl]="name">
    <option *ngFor="let p of pages" [value]="p">{{p}}</option>
  </select>
</label>
<spotfire-viewer
  [url]="url"
  [path]="path"
  [page]="name.value"
  [customization]="cust">
</spotfire-viewer>

<h1>Template with configuration on back of the card:</h1>
<spotfire-editor
  [url]="url"
  [path]="path"
  [page]="page"
  [customization]="cust">
</spotfire-editor>

<h1>Specific template (with marking):</h1>
<my-spotfire
  [url]="url"
  [path]="path"
  [page]="page"
  [customization]="cust"
  [markingOn]="mon"
  (markingEvent)="onMarking($event)">
</my-spotfire>

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
  name = new FormControl('Sales performance');
  pages = [ 'Sales performance' , 'Territory analysis' , 'Effect of promotions'];

  onMarking = (e: Event) => {
    console.log('[SRC_CONTAINER] onMarking returns', e);
    this.markedData = e;
  }
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, MySpotfireWrapperComponent],
  entryComponents: [MySpotfireWrapperComponent]
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
