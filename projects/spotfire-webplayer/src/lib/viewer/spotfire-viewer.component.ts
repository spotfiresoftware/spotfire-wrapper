// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import {
  Component, Input, EventEmitter, ViewChild,
  ElementRef, Output, OnChanges, SimpleChanges, ViewEncapsulation
} from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { LazyLoadingLibraryService } from '../lazy-loading-library.service';
import { SpotfireCustomization, SpotfireFilter } from '../spotfire-customization';
import { DocMetadata, Application, Document, CUSTLABELS, Marking, Data } from '../spotfire-webplayer';
import { PersistanceService } from '../persitence.service';

// https://community.tibco.com/wiki/tibco-spotfire-javascript-api-overview
// https://community.tibco.com/wiki/mashup-example-multiple-views-using-tibco-spotfire-javascript-api

declare let spotfire: any;

@Component({
  templateUrl: 'spotfire-viewer.component.html',
  encapsulation: ViewEncapsulation.None
})

export class SpotfireViewerComponent implements OnChanges {
  @Input() debug = true;
  @Input() url: string;
  @Input() page: string;
  @Input() sid: string;
  @Input() path: string;
  @Input() customization: SpotfireCustomization | string;
  @Input() filters: Array<SpotfireFilter> | string;
  private version = '7.14';
  @Input() config = {};
  @Input() markingOn: { string: Array<String> } | string;
  @Input() maxRows = 10;
  @Input() parameters = '';
  @ViewChild('spot', { read: ElementRef }) spot: ElementRef;
  errorMessages = [];

  metadata: DocMetadata;
  edit = false;

  // Optional configuration block
  private reloadAnalysisInstance = false;
  private document: Document;
  private app: Application;

  private filterSubject = new BehaviorSubject<Array<{}>>([]);
  public filter$: Observable<Array<{}>> = this.filterSubject.asObservable();
  @Output() filteringEvent: EventEmitter<any> = new EventEmitter(false);

  private markerSubject = new BehaviorSubject<{}>({});
  public marker$: Observable<{}> = this.markerSubject.asObservable();
  @Output() markingEvent: EventEmitter<any> = new EventEmitter(false);
  private markedRows = {};

  view: any;
  longTime = false;
  custLabels = CUSTLABELS;

  doConsole = (...args: any[]) => {
    if (this.debug) {
      console.log('[SPOTFIRE-VIEWER]', args);
    }
  }
  constructor(
    public lazySvc: LazyLoadingLibraryService,
    public storSvc: PersistanceService) {
    this.doConsole('Welcome !');

    setTimeout(() => this.longTime = true, 6000);
  }
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
    if (typeof this.markingOn === 'string') {
      this.markingOn = JSON.parse(this.markingOn);
    }

    this.doConsole('display', changes, this.url, this.path, this.customization, this.maxRows, this.app, this.markingOn);
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

  stopPropagation = (e) => e.stopPropagation();
  private get isMarkingWiredUp() { return this.markingEvent.observers.length > 0; }
  private get isFilteringWiredUp() { return this.filteringEvent.observers.length > 0; }
  private displayErrorMessage = (message: string) => {
    console.error('ERROR:', message);
    this.errorMessages.push(message);
  }

  /**
   * Get Spotfire JavaScript API (webPlayer) from url
   *
   * When a componenet is initiated or url is updated, it lazy loads the library
   * Once loaded it opens the path.
   *
   * @param url the webPlayer server url
   * @param path the path to the page
   * @param custo the initial customization info
   */
  protected openWebPlayer(url: string, path: string, custo: SpotfireCustomization) {
    this.edit = false;
    this.url = url;
    this.path = path;
    this.customization = custo;
    this.doConsole(`SpotfireViewerComponent openWebPlayer(${url})`);

    // lazy load the spotfire js API
    //
    setTimeout(() => {
      const sfLoaderUrl = `${this.url}/spotfire/js-api/loader.js`;
      this.lazySvc.loadJs(sfLoaderUrl).subscribe(() => {
        this.doConsole(`Spotfire ${sfLoaderUrl} is LOADED !!!`,
          spotfire, this.page, this.spot.nativeElement, this.customization);
        if (spotfire) {
          this.openPath(this.path);
        } else {
          this.displayErrorMessage('Spotfire is not loaded');
        }
      }, err => this.displayErrorMessage(err));
    }, 1000);
  }

  /**
   * Open the path using JavaScript API (spotfire.webPlayer.createApplication)
   *
   * @param path the absolute analysis path
   */
  protected openPath(path: string) {
    this.path = path;
    this.doConsole(`SpotfireViewerComponent openPath(${path})`, this.sid);
    // Create a Unique ID for this Spotfire dashboard
    //
    this.spot.nativeElement.id = this.sid ? this.sid : new Date().getTime();
    // Prepare Spotfire app with path/page/customization
    //
    this.app = new Application(this.url, this.customization, this.path,
      this.parameters, this.reloadAnalysisInstance, this.version, this.onCreateLoginElement);


    /**
     * Callback played once Spotfire API responds to Application creation
     *
     * Will open the target page
     */
    this.app.ready$.pipe(filter(d => d)).subscribe(_ => this.openPage(this.page));
  }

  /**
   * Callback played if Spotfire requires some login
   *
   */
  onCreateLoginElement = () => {
    this.doConsole('Creating the login element');
    // Optionally create and return a div to host the login button
    this.displayErrorMessage('Cannot login');
    return null;
  }
  protected doForm(doc: Document) { }
  /**
   * Open the Document page
   *
   * @param page the document page that will be displayed
   */
  protected openPage(page: string) {
    this.doConsole(`SpotfireViewerComponent openPage(${page})`);
    this.page = page;
    // Ask Spotfire library to display this path/page (with optional customization)
    //
    if (!this.app || !(this.app instanceof Application)) {
      throw new Error('Spotfire webapp is not created yet');
    }

    this.doConsole('SpotfireService openDocument',
      this.spot.nativeElement.id, `cnf=${page}`, this.config, this.app, this.customization);
    // this.doc = this.app.openDocument(this.spot.nativeElement.id, page, this.customization);

    // Here is the call to 'spotfire.webPlayer.createApplication'
    //
    this.document = this.app.getDocument(this.spot.nativeElement.id, page, this.customization);

    if (this.filters && this.document.filtering) {
      this.document.filtering.set(this.filters);
      this.loadFilters();
      this.doConsole('FILTER', this.filters);
    }

    this.doForm(this.document);


    if (this.markingOn) {
      this.app.onOpened$().subscribe((doc: Document) => {
        this.document.marking = new Marking(doc.marking);
        this.document.data = new Data(doc.data);
        this.doConsole(`[SPOTFIRE_VIEWER] Document.onOpened$: page is now opened:`, doc);
        this.document.data.getAllTables$().subscribe(tables => {
          this.document.marking.getMarkingNames$().subscribe(markingNames => markingNames.forEach(markingName => {
            Object.keys(this.markingOn).forEach(key => {
              let xolumns: Array<string> = this.markingOn[key];
              const tName = key;
              if (xolumns.length === 1 && xolumns[0] === '*') {
                xolumns = Object.keys(tables[tName]);
              }
              this.doConsole(`marking.onChanged(${markingName}, ${tName}, ${JSON.stringify(xolumns)}, ${this.maxRows})`);
              this.document.marking.onChanged$(markingName, tName, xolumns, this.maxRows).subscribe(
                f => {
                  this.doConsole('----> updateMarking$', f);
                  this.updateMarking(tName, markingName, f);
                });
            });
          }));
        });
      });
    }
    if (this.isFilteringWiredUp) {
      this.doConsole('isFilteringWiredUp');
      // Subscribe to filteringEvent and emit the result to the Output if filter panel is displayed
      //
      this.filter$.pipe(tap(f => this.doConsole('j\'emet filter', f)))
        .subscribe(f => this.filteringEvent.emit(f));
    }

    if (this.isMarkingWiredUp) {
      this.doConsole('isMarkingWiredUp');
      // Subscribe to markingEvent and emit the result to the Output
      //
      this.marker$.pipe(tap(f => this.doConsole('j\'emet marking', f)))
        .subscribe(f => this.markingEvent.emit(f));
    }
  }

  /**
   * Callback method played when marking changes are detected.
   *
   * Will gather all marking and emit an event back to caller.
   *
   */
  private updateMarking = (tName, mName, res) => {
    if (Object.keys(res).length > 0) {
      this.doConsole('Marking changes', tName, mName, res);
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
      //      this.doConsole('[MARKING] remove marking change', this.markedRows[mName][tName]);
      delete this.markedRows[mName][tName];
      if (Object.keys(this.markedRows[mName]).length === 0) {
        delete this.markedRows[mName];
      }
      this.markerSubject.next(this.markedRows);
    } else {
      this.doConsole('No marking', tName, mName, res);
    }
  }

  /**
   * Emit to caller the filters
   */
  private loadFilters() {
    if (this.isFilteringWiredUp) {
      const ALL = spotfire.webPlayer.includedFilterSettings.ALL_WITH_CHECKED_HIERARCHY_NODES;
      this.doConsole('SpotfireComponent loadFilters', this.filterSubject);
      this.document.getFiltering().getAllModifiedFilterColumns(ALL, fs => this.filterSubject.next(fs));
    }
  }
}
