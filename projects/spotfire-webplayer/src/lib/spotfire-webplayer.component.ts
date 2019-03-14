// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import {
  Component, Input, EventEmitter, ViewChild,
  ElementRef, Output, OnChanges, SimpleChanges, ViewEncapsulation
} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LazyLoadingLibraryService } from './lazy-loading-library.service';
import { SpotfireCustomization, SpotfireFilter } from './spotfire-customization';
import { DocMetadata, Application, Document, CUSTLABELS } from './spotfire-webplayer';
import { PersistanceService } from './persitence.service';

// https://community.tibco.com/wiki/tibco-spotfire-javascript-api-overview
// https://community.tibco.com/wiki/mashup-example-multiple-views-using-tibco-spotfire-javascript-api

declare let spotfire: any;

@Component({
  template: `<div style='height:100%; border:3px dotted green; border-radius:8px' #spot></div>`,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./my-theme.scss', './spotfire-webplayer.component.scss']
})

export class SpotfireWebplayerComponent implements OnChanges {
  @Input() url: string;
  @Input() page: string;
  @Input() sid: string;
  @Input() path: string;
  @Input() customization: SpotfireCustomization | string;
  @Input() filters: Array<SpotfireFilter> | string;
  private version = '7.14';
  @Input() config = {};
  @Input() markingOn: { string: Array<String> };
  @Input() maxRows = 10;
  @Input() parameters = '';
  @ViewChild('spot', { read: ElementRef }) spot: ElementRef;
  errorMessages = [];
  possibleValues = '';
  metadata: DocMetadata;
  edit = false;
  form: FormGroup;
  pages = [];

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
  public dataTables = {};
  private markedRows = {};

  view: any;
  longTime = false;
  custLabels = CUSTLABELS;

  constructor(
    public fb: FormBuilder,
    public lazySvc: LazyLoadingLibraryService,
    public storSvc: PersistanceService) {
    console.log('[SPOTFIRE-WEBPLAYER] Welcome !');
    setTimeout(() => this.longTime = true, 6000);
  }
  display(changes?: SimpleChanges) {
    console.log('[SPOTFIRE-WEBPLAYER] Display', changes);
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

    this.form = this.fb.group({
      url: [this.url, Validators.required],
      path: [this.path, Validators.required],
      page: this.fb.control({ value: this.page, disabled: false }), // !this.url }),
      cust: this.fb.group(this.customization as SpotfireCustomization),
      filters: this.fb.group({}),
      marking: this.fb.group({})
    });

    console.log('ngOnChange', changes, this.url, this.path, this.customization, this.maxRows, this.app);
    if (!changes || changes.url) {
      this.openWebPlayer(this.url, this.path, this.customization);
    } else if (this.app && changes.page) {
      this.openPage(this.page);
    } else {
      console.log(`The Url attribute is not provided, flip the dashboard and display form!`);
      this.edit = true;
      this.metadata = new DocMetadata();
    }
  }
  ngOnChanges = (changes: SimpleChanges) => this.display(changes);

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
  private openWebPlayer(url: string, path: string, custo: SpotfireCustomization) {
    this.edit = false;
    this.url = url;
    this.path = path;
    this.customization = custo;
    console.log(`SpotfireWebplayerComponent openWebPlayer(${url})`);

    // lazy load the spotfire js API
    //
    setTimeout(() => {
      const sfLoaderUrl = `${this.url}/spotfire/js-api/loader.js`;
      this.lazySvc.loadJs(sfLoaderUrl).subscribe(() => {
        console.log(`Spotfire ${sfLoaderUrl} is LOADED !!!`, spotfire, this.page, this.spot.nativeElement, this.customization);
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
  private openPath(path: string) {
    this.path = path;
    console.log(`SpotfireWebplayerComponent openPath(${path})`, this.sid);
    // Create a Unique ID for this Spotfire dashboard
    //
    this.spot.nativeElement.id = this.sid ? this.sid : new Date().getTime();
    // Prepare Spotfire app with path/page/customization
    //
    this.app = new Application(this.url, this.customization, this.path,
      this.parameters, this.reloadAnalysisInstance,
      this.version, this.onReadyCallback, this.onCreateLoginElement);
  }

  /**
   * Callback played once Spotfire API responds to Application creation
   *
   * Will open the target page
   */
  onReadyCallback = (response, newApp) => {
    this.app.setApp(newApp);
    if (response.status === 'OK') {
      // The application is ready, meaning that the api is loaded and that the analysis path
      // is validated for the current session(anonymous or logged in user)
      this.openPage(this.page);
    } else {
      const errMsg = `Status not OK. ${response.status}: ${response.message}`;
      console.error('onReadyCallback', errMsg, response);
      this.displayErrorMessage(errMsg);
    }
  }

  /**
   * Callback played if Spotfire requires some login
   *
   */
  onCreateLoginElement = () => {
    console.log('Creating the login element');
    // Optionally create and return a div to host the login button
    this.displayErrorMessage('Cannot login');
    return null;
  }

  /**
   * Open the Document page
   *
   * @param page the document page that will be displayed
   */
  private openPage(page: string) {
    console.log(`SpotfireWebplayerComponent openPage(${page})`);
    this.page = page;
    // Ask Spotfire library to display this path/page (with optional customization)
    //
    if (!this.app) {
      throw new Error('Spotfire webapp is not created yet');
    }

    console.log('SpotfireService openDocument', this.spot.nativeElement.id, `cnf=${page}`, this.config, this.app, this.customization);
    // this.doc = this.app.openDocument(this.spot.nativeElement.id, page, this.customization);

    // Here is the call to 'spotfire.webPlayer.createApplication'
    //
    this.document = this.app.getDocument(this.spot.nativeElement.id, page, this.customization);

    // then subscribe to observables to retrieves some info about the document
    //
    this.document.getDocumentMetadata$().subscribe(g => this.metadata = g);
    /*  this.document.getDocumentProperties$().subscribe(g => console.log('--> getDocumentProperties', g));
      this.document.getBookmarks$().subscribe(g => console.log('--> getBookmarks', g));
      this.document.getBookmarkNames$().subscribe(g => console.log('--> getBookmarkNames', g));
      this.document.getReports$().subscribe(g => console.log('--> getReports', g));
      */
    this.document.getPages$().subscribe(g => this.pages = g);
    this.document.getActivePage$().subscribe(g => this.form.get('page').patchValue(g.pageTitle));

    //   this.doc.exportActiveVisualAsImage(100, 200);
    // this.marking = this.document.marking;
    //  this.marking.getMarkingNames(g => console.log('SFINFO', 'getMarkingNames() = ', g));
    if (this.filters && this.document.filtering) {
      this.document.filtering.set(this.filters);
      this.loadFilters();
      console.log('[SPOTFIRE] FILTER', this.filters);
    }

    const difference = (a, b) => b.filter(i => a.indexOf(i) < 0);

    // get Table info
    //
    this.document.data.getAllTables$().subscribe(tables => {
      console.log('getAllTables$ returns', tables, this.filters, this.markingOn);
      const toList = (g) => g.map(f => `'${f}'`).join(', '),
        errTxt1 = '[spotfire-wrapper] Attribut marking-on contains unknwon',
        errTxt2 = '[spotfire-wrapper] Possible values for',
        fil: FormGroup = this.form.get('filters') as FormGroup,
        mar: FormGroup = this.form.get('marking') as FormGroup,
        tNames = Object.keys(tables),
        tdiff = this.markingOn ? difference(Object.keys(this.markingOn), tNames) : [];
      console.log('Tables : ', tNames, tdiff, fil);

      if (tdiff.length > 0) {
        this.errorMessages.push(`${errTxt1} table names: ${toList(tdiff)}`);
        this.possibleValues = `${errTxt2} table names are: ${toList(tNames)} `;
        //        return;
      }

      // Update marking and filters fields
      //
      Object.keys(tables).forEach(tname => {
        const columns = tables[tname];
        mar.addControl(tname, new FormControl(this.markingOn ? this.markingOn[tname] : null));
        if (!fil.contains(tname)) {
          fil.addControl(tname, new FormGroup({}));
        }
        const frm: FormGroup = fil.get(tname) as FormGroup;
        const cNames = Object.keys(columns);
        /*
        console.log('Columns : ', cNames, this.markingOn);
        if (this.markingOn) {
          const cdiff = this.markingOn[tname] ? this.difference(this.markingOn[tname], cNames) : [];
          console.log('Columns : ', cNames, cdiff);
          if (_.size(cdiff) > 0) {
            this.errorMessages.push(`${errTxt1} column names: ${toList(cdiff)}`);
            this.possibleValues = `${errTxt2} columns of table ${tname} are: ${toList(cNames)} `;
            //          return;
          }
        }
        */

        cNames.forEach(cname => {
          let flt2 = null;
          (this.filters as SpotfireFilter[] || []).some(element => {
            if (element.dataTableName === tname && element.dataColumnName === cname) {
              flt2 = element;
              return true;
            }
          });
          frm.addControl(cname, new FormControl(flt2 ? flt2.filterSettings.values : null));
        });
      });

      if (this.markingOn && this.document.marking) {
        this.document.marking.getMarkingNames$().subscribe(markingNames => markingNames.forEach(markingName => {
          Object.keys(this.markingOn).forEach(key => {
            let xolumns: Array<string> = this.markingOn[key];
            const tName = key;
            if (xolumns.length === 1 && xolumns[0] === '*') {
              xolumns = Object.keys(tables[tName]);
            }
            console.log(`marking.onChanged(${markingName}, ${tName}, ${JSON.stringify(xolumns)}, ${this.maxRows})`);
            this.document.marking.onChanged$(markingName, tName, xolumns, this.maxRows).subscribe(
              f => {
                console.log('----> updateMarking$', f);
                this.updateMarking(tName, markingName, f);
              });
          });
        }));
      }
      this.dataTables = tables;
    });

    if (this.isFilteringWiredUp) {
      console.log('isFilteringWiredUp');
      // Subscribe to filteringEvent and emit the result to the Output if filter panel is displayed
      //
      this.filter$.pipe(tap(f => console.log('j\'emet filter', f)))
        .subscribe(f => this.filteringEvent.emit(f));
    }

    if (this.isMarkingWiredUp) {
      console.log('isMarkingWiredUp');
      // Subscribe to markingEvent and emit the result to the Output
      //
      this.marker$.pipe(tap(f => console.log('j\'emet marking', f)))
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
      console.log('[MARKING] un marking change', tName, mName, res);
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
      //    console.log('[MARKING] on publie', this.markedRows);
      this.markerSubject.next(this.markedRows);
    } else if (this.markedRows[mName] && this.markedRows[mName][tName]) {
      // remove the marked row if no marking
      //
      //      console.log('[MARKING] remove marking change', this.markedRows[mName][tName]);
      delete this.markedRows[mName][tName];
      if (Object.keys(this.markedRows[mName]).length === 0) {
        delete this.markedRows[mName];
      }
      this.markerSubject.next(this.markedRows);
    } else {
      console.log('[MARKING] rien a faire', tName, mName, res);
    }
  }

  /**
   * Emit to caller the filters
   */
  private loadFilters() {
    if (this.isFilteringWiredUp) {
      const ALL = spotfire.webPlayer.includedFilterSettings.ALL_WITH_CHECKED_HIERARCHY_NODES;
      console.log('SpotfireComponent loadFilters', this.filterSubject);
      this.document.getFiltering().getAllModifiedFilterColumns(ALL, fs => this.filterSubject.next(fs));
    }
  }

  /**
   * When user hits Update button, depending on what settings are modified, call the right level of
   * method to update the dashboard
   */
  update = (e) => {
    this.edit = false;
    e.stopPropagation();
    const isD = (z) => this.form.get(z).dirty;
    const onlyTrueProps = (t) => Object.keys(t).filter(key => t[key] === true)
      .reduce((obj, key) => { obj[key] = t[key]; return obj; }, {});
    console.log('SpotfireWebplayerComponent Update', this.form.getRawValue(),
      `u:${isD('url')}, p:${isD('path')}, a:${isD('page')}, c:${isD('cust')}, f:${isD('filters')}, m:${isD('marking')}`);
    const cus = new SpotfireCustomization(this.form.get('cust').value);
    if (isD('url')) {
      this.openWebPlayer(this.form.get('url').value, this.form.get('path').value, cus);
    } else if (isD('path') || isD('filters') || isD('marking') || isD('cust')) {
      this.path = isD('path') ? this.form.get('path').value : this.path;
      this.page = isD('page') ? this.form.get('page').value : this.page;
      console.log('Marking : ', this.form.get('marking').value);
      this.customization = cus;
      this.pages = [];
      const allFilters: Array<SpotfireFilter> = [];
      if (this.form.get('filters').value) {
        const fltersValue = this.form.get('filters').value;
        Object.keys(fltersValue).forEach(dataTableName => {
          const flt = fltersValue[dataTableName];
          Object.keys(flt).forEach(dataColumnName =>
            allFilters.push(new SpotfireFilter({
              dataTableName: dataTableName,
              dataColumnName: dataColumnName,
              filterSettings: { values: flt[dataColumnName] }
            })));
        });
      }
      this.filters = allFilters;
      if (this.sid) {
        this.storSvc.set('url', this.form.get('url').value);
        this.storSvc.set('path', this.form.get('path').value);
        this.storSvc.set('page', this.form.get('page').value);
        this.storSvc.set('cust', onlyTrueProps(this.customization));
        this.storSvc.set('flts', this.filters);
        this.storSvc.set('mark', this.markingOn);
      }
      this.openPath(this.path);
    } else if (isD('page')) {
      // if only page has changed, just refresh it
      //
      if (this.sid) {
        this.storSvc.set('page', this.form.get('page').value);
      }
      this.openPage(this.form.get('page').value);
    }
  }
}