// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import {
  Component, Input, EventEmitter, ViewChild,
  ElementRef, Output, OnChanges, SimpleChanges, ViewEncapsulation, OnInit
} from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SpotfireCustomization, SpotfireFilter } from '../spotfire-customization';
import { DocMetadata, Application, Document, SpotfireParameters } from '../spotfire-webplayer';
import { DocumentService } from '../document.service';

// https://community.tibco.com/wiki/tibco-spotfire-javascript-api-overview
// https://community.tibco.com/wiki/mashup-example-multiple-views-using-tibco-spotfire-javascript-api

declare let spotfire: any;

@Component({
  selector: 'spotfire-viewer',
  exportAs: 'spotfireViewer',
  templateUrl: 'spotfire-viewer.component.html',
  encapsulation: ViewEncapsulation.None
})

export class SpotfireViewerComponent implements OnChanges, OnInit {
  /**
   * @description
   * print debug logs to JS console. Default to false
   */
  @Input() debug = false;

  /**
   * @description
   * The URL to the Web Player server
   */
  @Input() url: string;

  /**
   * @description
   * The path in the library to the analysis to open.
   */
  @Input() path: string;

  /**
   * @description
   * Optional initial page. The page can either be expressed
   * as an integer (0-based page index) or as a string (page name).
   */
  @Input() page: string;

  /**
  * @description
  * Optional unique id to read/write settings from local storage
  */
  @Input() sid: string;

  /**
  * @description
  * Optional instance of a Customization instance. 
  * If set, this will override the customizationInfo instance held by the application.
  */
  @Input() customization: SpotfireCustomization | string;

  /**
    * @description
    * Optional. Array of filters that will be applied once page is loaded.
    */
  @Input() filters: Array<SpotfireFilter> | string;
  @Input() markingOn: {} | string;
  @Input() maxRows = 10;

  protected spotParams: SpotfireParameters = new SpotfireParameters();
  /**
    * @description
    * Optional. Load parameters for the analysis.
    */
  @Input() set parameters(value: string) {
    this._parameters = value;
    this.spotParams._parameters = value;
    if (this.app) {
      this.openPath(this.path);
    }
  }
  private _parameters: string;

  @ViewChild('spot', { static: true, read: ElementRef }) spot: ElementRef;
  errorMessages = [];

  /* metadata contains Information about the Spotfire analysis */
  metadata: DocMetadata;
  edit = false;
  private document: Document;
  private app: Application;
  /* Filtering observables, emitter and subject*/
  private filterSubject = new BehaviorSubject<Array<{}>>([]);
  public filter$: Observable<Array<{}>> = this.filterSubject.asObservable();

  /**
    * @description
    * Optional. emit filters set by user in dashboard
    */
  @Output() filteringEvent: EventEmitter<any> = new EventEmitter(false);

  /* Marking observables, emitter and subject*/
  private markerSubject = new BehaviorSubject<{}>({});
  public marker$: Observable<{}> = this.markerSubject.asObservable();
  /**
   * @description
   * Optional. emit marking set by user in dashboard
   */
  @Output() markingEvent: EventEmitter<any> = new EventEmitter(false);
  private markedRows = {};

  view: any;
  longTime = false;

  constructor(public docSvc: DocumentService) {
    console.log('SPOTFIRE WRAPPER - 10 juillet - Angular 8')
    this.doConsole('Welcome !');
    setTimeout(() => this.longTime = true, 6000);
  }

  ngOnInit(): void {
    this.doConsole('OnInit', this.url, this.path);
    this.display();
  }

  doConsole = (...args: any[]) => this.debug && console.log('[SPOTFIRE-VIEWER]', ...args);

  /**
   * @description
   * Redraw the dashboard.
   * Depending on nature of change (url/path/page) the dashboard is fully refreshed or adjusted accordingly
   * @param changes The list of changes to apply
   */

  display(changes?: SimpleChanges) {
    this.doConsole('Display', changes);
    if (typeof this.customization === 'string') {
      this.customization = new SpotfireCustomization(JSON.parse(this.customization));
    } else {
      this.customization = new SpotfireCustomization(this.customization);
    }

    if (typeof this.filters === 'string') {
      const allFilters: Array<SpotfireFilter> = [];
      JSON.parse(this.filters).forEach((m: SpotfireFilter) => allFilters.push(new SpotfireFilter(m)));
      this.filters = allFilters;
    }
    if (typeof this.markingOn === 'string' && this.markingOn !== '*') {
      this.markingOn = JSON.parse(this.markingOn);
    }

    this.doConsole('display', changes, this.url, this.path, 'PAGE=', this.page, this.customization, this.maxRows, this.app, this.markingOn);
    if (!changes || changes.url) {
      this.openWebPlayer(this.url, this.path, this.customization);
    } else if (this.app && changes.page) {
      this.openPage(this.page);
    } else {
      this.doConsole(`The Url attribute is not provided, flip the dashboard and display form!`);
      this.edit = true;
      this.metadata = new DocMetadata();
    }
  }
  ngOnChanges = (changes: SimpleChanges) => {
    if (!!changes) {
      this.display(changes);
    }
  }

  stopPropagation = (e: Event) => e.stopPropagation();
  private isMarkingWiredUp = () => this.markingEvent.observers.length > 0;
  private isFiltingWiredUp = () => this.filteringEvent.observers.length > 0;
  private displayErrorMessage = (message: string) => {
    console.error('ERROR:', message);
    this.errorMessages.push(message);
    if (!this.spotParams.document) {
      // Do not display the info Message when document is running
      this.spot.nativeElement.style.fontFamily = 'monospace';
      this.spot.nativeElement.style.color = '#e82127';
      this.spot.nativeElement.style.textAlign = 'center';
      this.spot.nativeElement.style.padding = '30px';
      this.spot.nativeElement.textContent = this.errorMessages.join('<br>');
    }
  }

  private displayInfoMessage = (message: string) => {
    console.log(message);
    if (!this.spotParams.document && this.debug) {
      // Do not display the info Message when document is running
      this.spot.nativeElement.style.fontFamily = 'monospace';
      this.spot.nativeElement.style.color = 'black';
      this.spot.nativeElement.style.textAlign = 'center';
      this.spot.nativeElement.textContent = message;
    }
  }

  /**
   * @description
   * Get Spotfire JavaScript API (webPlayer) from url
   *
   * When a componenet is initiated or url is updated, it lazy loads the library
   * Once loaded it opens the path.
   *
   * @param url the webPlayer server url
   * @param path the path to the page
   * @param custo the initial customization info
   */
  protected openWebPlayer(url: string, path: string, customization: SpotfireCustomization) {
    this.edit = false;
    this.url = url;
    this.path = path;
    this.customization = customization;
    this.doConsole(`SpotfireViewerComponent openWebPlayer(${url})`);

    this.displayInfoMessage(`${this.url}...`);

    // Create a Unique ID for this Spotfire dashboard
    //
    this.spot.nativeElement.id = this.sid ? this.sid : new Date().getTime();
    this.spotParams = { ...this.spotParams, path, url, customization, domid: this.spot.nativeElement.id, page: this.page };

    this.docSvc.openWebPlayer$(this.spotParams).subscribe(
      doc => this.afterDisplay(doc),
      err => this.displayErrorMessage(err));
  }

  /**
   * @description
   * Open the path using JavaScript API (spotfire.webPlayer.createApplication)
   *
   * @param path the absolute analysis path
   */
  protected openPath(path: string) {
    this.path = path;
    this.displayInfoMessage(`${this.url}/${path}...`);
    this.doConsole(`SpotfireViewerComponent openPath(${path})`, this.sid);
    this.spotParams = { ...this.spotParams, path, domid: this.spot.nativeElement.id };
    this.docSvc.openPath$(this.spotParams).subscribe(
      doc => this.afterDisplay(doc),
      err => this.displayErrorMessage(err));
  }

  protected doForm(doc: Document) { }
  /**
   * @description
   * Open the Document page
   *
   * @param page the document page that will be displayed
   */
  public openPage(page: string) {
    this.displayInfoMessage(`${this.url}/${this.path}/${page ? page : ''}...`);
    this.doConsole(`SpotfireViewerComponent openPage(${page})`);
    this.page = page;
    this.spotParams = { ...this.spotParams, page };
    const p = this.spotParams;
    this.docSvc.openPage$(p).subscribe(doc => this.afterDisplay(doc));
  }

  private afterDisplay = (doc: Document) => {
    this.doConsole(`SpotfireViewerComponent openPage(${this.spotParams.page}) returns`, doc);
    this.document = doc;
    if (this.filters && this.document.getFiltering()) {
      const flt = this.document.getFiltering();
      flt.resetAllFilters();
      /*
      this.doConsole(`SpotfireViewerComponent set Filter(avant)`, this.filters);
      (this.filters as Array<SpotfireFilter>).forEach(t => t.setFilterType(spotfire));
      this.doConsole(`SpotfireViewerComponent set Filter(apres)`, this.filters);
    */
      flt.set(this.filters);
      this.loadFilters();
      this.doConsole('FILTER', this.filters);
    }

    this.doForm(this.document);
    if (this.markingOn) {
      // Clear marking
      this.markerSubject.next({});
      this.document.getData().getTables$()
        .pipe(tap(allTableNames => this.doConsole(`All tables and column names:`, allTableNames)))
        .subscribe(allTableNames => this.document.getMarking().getMarkingNames$()
          .pipe(tap(markingNames => this.doConsole(`All marking names:`, markingNames)))
          .subscribe(markingNames => markingNames.forEach(markingName => {
            const tableNames = this.markingOn === '*' ? allTableNames : this.markingOn;
            Object.keys(tableNames).forEach(tName => {
              let columnNames: Array<string> = this.markingOn === '*' ? allTableNames[tName] : tableNames[tName];
              if (columnNames.length === 1 && columnNames[0] === '*') {
                columnNames = allTableNames[tName];
              }
              this.doConsole(`marking.onChanged(${markingName}, ${tName}, ${JSON.stringify(columnNames)}, ${this.maxRows})`);
              this.document.getMarking().onChanged$(markingName, tName, columnNames, this.maxRows)
                .subscribe(f => this.updateMarking(tName, markingName, f));
            });
          })));
    }
    if (this.isFiltingWiredUp()) {
      this.doConsole('we have observers for filtering');
      // Subscribe to filteringEvent and emit the result to the Output if filter panel is displayed
      //
      this.filter$.pipe(tap(f => this.doConsole('Emit filter', f)))
        .subscribe(f => this.filteringEvent.emit(f));
    }

    if (this.isMarkingWiredUp()) {
      this.doConsole('we have observers for marking');
      // Subscribe to markingEvent and emit the result to the Output
      //
      this.marker$.pipe(tap(f => this.doConsole('Emit marking', f)))
        .subscribe(f => this.markingEvent.emit(f));
    }
    // console.log('YES loadFilters');
    // setInterval(() => this.loadFilters(), 3000);
  }

  /**
   * @description
   * Callback method played when marking changes are detected.
   *
   * Will gather all marking and emit an event back to caller.
   *
   * @param tName Table name
   * @param mName Maring name
   * @param res marked rows returned by Spotfire
   */
  private updateMarking = (tName: string, mName: string, res: {}) => {
    if (Object.keys(res).length > 0) {
      this.doConsole(`We have marked rows on marking '${mName}' for table '${tName}':`, res);
      // update the marked row if partial selection
      //
      if (!this.markedRows[mName]) {
        this.markedRows[mName] = {};
      }
      if (!this.markedRows[mName][tName]) {
        this.markedRows[mName][tName] = res;
      } else {
        this.markedRows[mName][tName] = Object.assign(this.markedRows[mName][tName], res);
      }
      //   this.doConsole('[MARKING] on publie', this.markedRows);
      this.markerSubject.next(this.markedRows);
    } else if (this.markedRows[mName] && this.markedRows[mName][tName]) {
      // remove the marked row if no marking
      //
      delete this.markedRows[mName][tName];
      if (Object.keys(this.markedRows[mName]).length === 0) {
        delete this.markedRows[mName];
      }
      this.markerSubject.next(this.markedRows);
    } else {
      //  this.doConsole(`No rows are marked on marking '${mName}' for table '${tName}'`);
    }
    this.loadFilters();
  }

  /**
   * @description
   * Emit to caller the filters
   */
  private loadFilters() {
    //  console.log('AA Nicolas loadFilters BLOUP ! (19 juin 2019)');
    if (this.isFiltingWiredUp()) {
      this.document.getFiltering().getAllModifiedFilterColumns()
        .subscribe(fs => this.filterSubject.next(fs));
    }
    //    this.document.getFiltering().getAllModifiedFilterColumns()
    //      .subscribe(fs => console.log('les FILTERS:', fs));
  }
}
