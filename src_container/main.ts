import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';


import { SpotfireViewerComponent } from 'spotfire-webplayer';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { SpotfireCustomization } from 'projects/spotfire-webplayer/src/lib/spotfire-customization';

@Component({
  selector: 'my-spotfire',
  template: `Override spotfire-wrapper template :
  <button *ngFor="let p of ['Sales performance', 'Territory analysis', 'Effect of promotions']" (click)="showPage(p)">{{p}}</button>
  <div class="mys" #spot></div>`,
  styles: [`
  div.mys { width:600px; height:400px; background:#ebebeb; border-radius: 20px}
  button { padding:10px }
`]
})
class MySpotfireWrapperComponent extends SpotfireViewerComponent implements OnInit {
  // No var please (or set a contructor)
  ngOnInit(): void {
    //    pages = ['Sales performance', 'Territory analysis', 'Effect of promotions'];
    this.url = 'https://spotfire-next.cloud.tibco.com';
    this.path = 'Samples/Sales and Marketing';
    this.customization = { showAuthor: true, showFilterPanel: true, showToolBar: true } as SpotfireCustomization;
    this.markingOn = '{"SalesAndMarketing": ["*"]}';
    this.showPage('');
    this.markingEvent.subscribe(e => console.log('MARKING MySpot', e));
  }
  showPage(page: string) {
        this.page = page;
        console.log('Show', this.url, this.path, this.page);
        this.display();
      }
}


/*

@Component({
  selector: 'my-spotfire',
  template: `Override spotfire-wrapper template :<br>
  <button *ngFor="let p of pages" (click)="showPage(p)">{{p}}</button>
  <div class="mys" #spot></div>`,
  styles: [`div.mys { width:600px; height:400px; background:#ebebeb; border-radius: 20px}`]
})
class MySpotfireWrapperComponent extends SpotfireViewerComponent implements OnInit {

  pages = ['Sales performance', 'Territory analysis', 'Effect of promotions'];

  ngOnInit(): void {
    this.debug = true;
    this.url = 'https://spotfire-next.cloud.tibco.com';
    this.path = 'Samples/Sales and Marketing';
    this.customization = { showAuthor: true, showFilterPanel: true, showToolBar: true } as SpotfireCustomization;
    this.markingOn = '{"SalesAndMarketing": ["*"]}';
    this.display();
    this.markingEvent.subscribe(e => console.log('MARKING MySpot', e));
  }
  showPage(page: string) {
//    this.page = page;
    console.log('Show', this.url, this.path, this.page);
    this.display();
  }
}

*/

@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<p> {{url}} et {{path}}

<!--
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
<spotfire-viewer style='display:block; height:500px'
  [url]="url"
  [path]="path"
  [customization]="cust"
  [markingOn]="mon2"
  (markingEvent)="onMarking($event)">
</spotfire-viewer>

<h1>Template with configuration on back of the card:</h1>
<spotfire-editor
  [url]="url"
  [path]="path"
  [page]="page"
  [customization]="cust">
</spotfire-editor>

<h1>Specific template (with marking):</h1> -->
<my-spotfire></my-spotfire>

<pre>{{markedData|json}}</pre>
`})
class AppComponent {
  url = 'https://spotfire-next.cloud.tibco.com';
  path = 'Samples/Sales and Marketing';
  // path = '/TIBCO Labs/ProcessMining_custom_queries_final';
  // url = 'https://23.22.187.212';
  page = 'Territory analysis';
  cust = { showAuthor: true, showFilterPanel: true, showToolBar: true };
  mon = { SalesAndMarketing: ['*'] };
  mon2 = { cases: ['*'] };
  title = 'container';
  markedData = {};
  name = new FormControl('Sales performance');
  pages = ['Sales performance', 'Territory analysis', 'Effect of promotions'];

  onMarking = (e: Event) => {
    console.log('[SRC_CONTAINER] onMarking returns', e);
    this.markedData = e['detail'];
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
