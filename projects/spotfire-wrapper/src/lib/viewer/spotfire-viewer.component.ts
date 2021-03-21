/*
* Copyright (c) 2019-2021. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import {
  Component, ElementRef, EventEmitter, Input,
  OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DocumentService } from '../document.service';
import { SpotfireCustomization, SpotfireFilter } from '../spotfire-customization';
import { SpotfireServerService } from '../spotfire-server.service';
import {
  SpotfireApplication, SpotfireDocument, SpotfireDocumentMetadata, SpotfireFiltering, SpotfireParameters, SpotfireReporting, SpotfireServer
} from '../spotfire-webplayer';

// https://community.tibco.com/wiki/tibco-spotfire-javascript-api-overview
// https://community.tibco.com/wiki/mashup-example-multiple-views-using-tibco-spotfire-javascript-api

declare let spotfire: any;
const DEFAULT_VERSION = '7.14';

@Component({
  selector: 'spotfire-viewer',
  exportAs: 'spotfireViewer',
  templateUrl: 'spotfire-viewer.component.html',
  encapsulation: ViewEncapsulation.None
})

export class SpotfireViewerComponent implements OnChanges, OnInit {
  /**
   * @description
   * Optional. Load parameters for the analysis.
   */
  @Input() parameters: string;

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
   * Optional version to customize the version used when requesting the Spotfire JavaScript API.
   * Defaults to 7.14.
   */

  @Input() version: string;

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

  @Input() markingOn: any | string;
  @Input() maxRows = 10;

  @ViewChild('spot', { static: true, read: ElementRef }) spot: ElementRef;

  /**
   * @description
   * Optional. emit filters set by user in dashboard
   */
  @Output() filteringEvent: EventEmitter<any> = new EventEmitter(false);
  /**
   * @description
   * Optional. emit marking set by user in dashboard
   */
  @Output() markingEvent: EventEmitter<any> = new EventEmitter(false);

  /**
   * @description
   * Optional. emit an instance of a SpotfireReporting whenever a new page it ready
   * Following methods are available based on returned instance:
   *  - print()
   *  - exportToPowerPoint()
   *  - exportToPdf()
   *  - exportReport(reportName)
   *  - getReports(callback)
   *  - exportActiveVisualAsImage(width, height)
   */
  @Output() reporting: EventEmitter<SpotfireReporting> = new EventEmitter();

  /**
   * @description
   * Optional. emit an instance of a Filtering whenever a new page it ready
   * Following methods are available based on returned instance:
   *  - getFilteringScheme(filteringSchemeName)
   *  - getFilteringSchemes()
   *  - getActiveFilteringScheme()
   */
  @Output() filtering: EventEmitter<SpotfireFiltering> = new EventEmitter();
  @Output() document: EventEmitter<SpotfireDocument> = new EventEmitter();

  /**
   * @description
   * Optional. Emit an instance of a SpotfireServer whenever TIBCO Spotfire Server status is available.
   */
  @Output() serverStatusEvent: EventEmitter<SpotfireServer> = new EventEmitter();

  /** List of error messages seen so far */
  errorMessages = [];

  /* metadata contains Information about the Spotfire analysis */
  metadata: SpotfireDocumentMetadata;
  edit = false;

  view: any;
  longTime = false;

  readonly filter$: Observable<any[]>;
  readonly marker$: Observable<any>;

  protected spotParams: SpotfireParameters = new SpotfireParameters();
  private _filters: SpotfireFilter[];
  private _document: SpotfireDocument;
  private app: SpotfireApplication;
  /* Filtering observables, emitter and subject*/
  private filterSubject = new BehaviorSubject<any[]>([]);

  /* Marking observables, emitter and subject*/
  private markerSubject = new BehaviorSubject<any>({});
  private markedRows = {};

  constructor(public docSvc: DocumentService, private spotfireServerSvc: SpotfireServerService) {
    this.filter$ = this.filterSubject.asObservable();
    this.marker$ = this.markerSubject.asObservable();
    this.doConsole('Welcome to Wrapper for TIBCO Spotfire(R)!');
    setTimeout(() => this.longTime = true, 6000);
  }

  @Input() set filters(value: SpotfireFilter[] | string) {
    if (typeof value === 'string') {
      const allFilters: SpotfireFilter[] = [];
      JSON.parse(value).forEach((m: SpotfireFilter) => allFilters.push(new SpotfireFilter(m)));
      this._filters = allFilters;
    } else {
      this._filters = value as SpotfireFilter[];
    }
    this.setFilters();
  }

  ngOnInit(): void {
    this.spotfireServerSvc.monitorSpotfireServerStatus(this.url);
    this.spotfireServerSvc.serverStatusEvent.subscribe((e: SpotfireServer) => {
      this.doConsole('SPOTFIRE-SERVER-SERVICE received event ' + JSON.stringify(e));
      this.serverStatusEvent.emit(e);
    });
    if (!this.version) {
      this.version = DEFAULT_VERSION;
    }
    this.doConsole('OnInit', this.url, this.path, this.version);
    this.display();
  }

  // eslint-disable-next-line no-console
  doConsole = (...args: any[]) => this.debug && console.log('[SPOTFIRE-VIEWER]', ...args);

  /**
   * @description
   * Redraw the dashboard.
   * Depending on nature of change (url/path/page) the dashboard is fully refreshed or adjusted accordingly
   * @param changes The list of changes to apply
   */

  display(changes?: SimpleChanges) {
    this.doConsole('Display', changes);
    if (this.isMonitorWiredUp) {
      this.doConsole('Listen for Spotfire Server status changes');
      this.spotfireServerSvc.monitorSpotfireServerStatus(this.url);
      this.spotfireServerSvc.serverStatusEvent.subscribe((e: SpotfireServer) => {
        this.doConsole('SPOTFIRE-SERVER-SERVICE received event ' + JSON.stringify(e));
        this.serverStatusEvent.emit(e);
      });
    }

    if (typeof this.customization === 'string') {
      this.customization = new SpotfireCustomization(JSON.parse(this.customization));
    } else {
      this.customization = new SpotfireCustomization(this.customization);
    }

    if (typeof this._filters === 'string') {
      const allFilters: SpotfireFilter[] = [];
      JSON.parse(this._filters).forEach((m: SpotfireFilter) => allFilters.push(new SpotfireFilter(m)));
      this._filters = allFilters;
    }
    if (typeof this.markingOn === 'string' && this.markingOn !== '*') {
      this.markingOn = JSON.parse(this.markingOn);
    }

    this.doConsole('display', changes, this.url, this.version, this.path, 'PAGE=', this.page, this.customization, this.maxRows,
    this.app, this.markingOn);
  if (!changes || changes.url) {
    this.openWebPlayer(this.url, this.path, this.customization);
  } else if (this.app && changes.page) {
      this.openPage(this.page);
    } else {
      this.doConsole(`The Url attribute is not provided, flip the dashboard and display form!`);
      this.edit = true;
      this.metadata = new SpotfireDocumentMetadata();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.debug) {
      this.docSvc.debug = this.debug;
      this.spotfireServerSvc.debug = this.debug;
    }
    if (!!changes) {
      this.display(changes);
    }
  };

  stopPropagation = (e: Event) => e.stopPropagation();
  /**
   * @description
   * Open the Document page
   *
   * @param page the document page that will be displayed
   */
  openPage(page: string) {
    this.displayInfoMessage(`${this.url}/${this.path}/${page ? page : ''}...`);
    this.doConsole(`SpotfireViewerComponent openPage(${page})`);
    this.page = page;
    this.spotParams = { ...this.spotParams, page };
    const p = this.spotParams;
    if (this.parameters !== '') {
      this.spotParams._parameters = this.parameters;
    }
    this.docSvc.openPage$(p).subscribe(doc => this.afterDisplay(doc));
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
    this.spotParams = {
      ...this.spotParams,
      path, url,
      customization, version: this.version,
      domid: this.spot.nativeElement.id,
      page: this.page, _parameters: this.parameters
    };

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

  /**
   * @description
   * Display error message in the DOM content of the spotfire-wrapper
   * This function can be overriden
   * @param message error message to be displayed
   */
  protected displayErrorMessage = (message: string) => {
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
  };

  /**
   * @description
   * Display info message if debug mode is set in the DOM content of the spotfire-wrapper
   * This function can be overriden
   * @param message INfo message to be displayed
   */
  protected displayInfoMessage = (message: string) => {
    // console.log(message);
    if (!this.spotParams.document && this.debug) {
      // Do not display the info Message when document is running
      this.spot.nativeElement.style.fontFamily = 'monospace';
      this.spot.nativeElement.style.color = 'black';
      this.spot.nativeElement.style.textAlign = 'center';
      this.spot.nativeElement.textContent = message;
    }
  };

  private isMarkingWiredUp = () => this.markingEvent.observers.length > 0;
  private isFiltingWiredUp = () => this.filteringEvent.observers.length > 0;
  private isFilteringWiredUp = () => this.filtering.observers.length > 0;
  private isReportingWiredUp = () => this.reporting.observers.length > 0;
  private isDocumentWiredUp = () => this.document.observers.length > 0;
  private isMonitorWiredUp = () => this.serverStatusEvent.observers.length > 0;

  private afterDisplay = (doc: SpotfireDocument) => {
    this.doConsole(`SpotfireViewerComponent afterDisplay`, doc, ', filters:', this._filters, ', markingON', this.markingOn);
    this._document = doc;
    this.setFilters();

    if (this.isReportingWiredUp()) {
      this.doConsole(`we have observers for reportingEvent`);
      const report = new SpotfireReporting(this._document);
      this.reporting.emit(report);
    }
    if (this.isDocumentWiredUp()) {
      this.doConsole(`we have observers for document`);
      this.document.emit(this._document);
    }
    if (this.isFilteringWiredUp()) {
      this.doConsole('we have observers for filtering');
      this.filtering.emit(this._document.getFiltering());
    }

    if (this.markingOn) {
      // Clear marking
      this.markerSubject.next({});
      this.doConsole(`SpotfireViewerComponent afterDisplay has markingOn=`, this.markingOn);
      const data = this._document.getData();
      if (data === undefined) {
        console.warn('[SpotfireViewerComponent] document getData() contains', data);
      } else {
        data.getTables$()
          .pipe(tap(allTableNames => this.doConsole(`All tables and column names:`, allTableNames)))
          .subscribe(allTableNames => this._document.getMarking().getMarkingNames$()
            .pipe(tap(markingNames => this.doConsole(`All marking names:`, markingNames)))
            .subscribe(markingNames => markingNames.forEach(markingName => {
              const tableNames = this.markingOn === '*' ? allTableNames : this.markingOn;
              Object.keys(tableNames).forEach(tName => {
                let columnNames: string[] = this.markingOn === '*' ? allTableNames[tName] : tableNames[tName];
                if (columnNames.length === 1 && columnNames[0] === '*') {
                  columnNames = allTableNames[tName];
                }
                this.doConsole(`marking.onChanged(${markingName}, ${tName}, ${JSON.stringify(columnNames)}, ${this.maxRows})`);
                this._document.getMarking().onChanged$(markingName, tName, columnNames, this.maxRows)
                  .subscribe(f => this.updateMarking(tName, markingName, f));
              });
            })));
      }
    }
    if (this.isFiltingWiredUp()) {
      this.doConsole('we have observers for filteringEvent');
      // Subscribe to filteringEvent and emit the result to the Output if filter panel is displayed
      //
      this.filter$.pipe(tap(f => this.doConsole('Emit filteringEvent', f)))
        .subscribe(f => this.filteringEvent.emit(f));
    }

    if (this.isMarkingWiredUp()) {
      this.doConsole('we have observers for markingEvent');
      // Subscribe to markingEvent and emit the result to the Output
      //
      this.marker$.pipe(tap(f => this.doConsole('Emit markingEvent', f)))
        .subscribe(f => this.markingEvent.emit(f));
    }
    // console.log('YES loadFilters');
    // setInterval(() => this.loadFilters(), 3000);
  };

  private setFilters() {
    if (this._document && this._filters && this._document.getFiltering()) {
      const flt = this._document.getFiltering();
      flt.resetAllFilters();
      flt.setFilters(this._filters);
      this.loadFilters();
      this.doConsole('setFilters', this._filters);
    }
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
  private updateMarking = (tName: string, mName: string, res: any) => {
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
  };

  /**
   * @description
   * Emit to caller the filters
   */
  private loadFilters() {
    //  console.log('AA Nicolas loadFilters BLOUP ! (19 juin 2019)');
    if (this.isFiltingWiredUp()) {
      this._document.getFiltering().getAllModifiedFilterColumns$()
        .subscribe(fs => this.filterSubject.next(fs));
    }
    //    this.document.getFiltering().getAllModifiedFilterColumns()
    //      .subscribe(fs => console.log('les FILTERS:', fs));
  }
}
