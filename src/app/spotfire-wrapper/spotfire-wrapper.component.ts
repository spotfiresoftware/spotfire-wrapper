// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import {
  Component, Input, AfterViewInit, EventEmitter, ViewChild,
  ElementRef, Output, OnChanges, SimpleChanges, ViewEncapsulation
} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import * as _ from 'underscore';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalStorageService } from 'angular-2-local-storage';
import { LazyLoadingLibraryService } from './lazy-loading-library.service';
import { SpotfireCustomization, SpotfireFilter } from './spotfire-customization';
import { DocMetadata, Application, Data, Document, CUSTLABELS } from './spotfire-webplayer';

// https://community.tibco.com/wiki/tibco-spotfire-javascript-api-overview
// https://community.tibco.com/wiki/mashup-example-multiple-views-using-tibco-spotfire-javascript-api

declare let spotfire: any;

@Component({
  templateUrl: './spotfire-wrapper.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../my-theme.scss',
    //    '../../../node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
    './spotfire-wrapper.component.scss']
})

export class SpotfireWrapperComponent implements AfterViewInit, OnChanges {
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
  @ViewChild('spot', { read: ElementRef }) spot: ElementRef;
  errorMessages = [];
  possibleValues = '';
  metadata: DocMetadata;
  edit = false;
  form: FormGroup;
  pages = [];

  // Optional configuration block
  private parameters = '';
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
  constructor(private localStorageService: LocalStorageService,
    private fb: FormBuilder, private service: LazyLoadingLibraryService) {
    setTimeout(() => this.longTime = true, 6000);
    console.log('SPOT URL', this.url, 'CUST=', this.customization, typeof this.filters, 'FILTERS=', this.filters);
  }
  stopPropagation = (e) => e.stopPropagation();

  private get isMarkingWiredUp() { return this.markingEvent.observers.length > 0; }
  private get isFilteringWiredUp() { return this.filteringEvent.observers.length > 0; }
  displayErrorMessage = (message: string) => {
    console.error('ERROR:', message);
    this.errorMessages.push(message);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.app && changes.page) {
      console.log('SpotfireWrapperComponent ngOnChanges', changes);
      this.openPage(changes.page.currentValue);
    }
  }

  private setFlts() {
    if (typeof this.filters === 'string') {
      const allFilters: Array<SpotfireFilter> = [];
      JSON.parse(this.filters).forEach(m => allFilters.push(new SpotfireFilter(m)));
      this.filters = allFilters;
    }
  }
  update = (e) => {
    this.edit = false;
    e.stopPropagation();
    const isD = (z) => this.form.get(z).dirty;
    console.log('SpotfireWrapperComponent Update',
      `u:${isD('url')}, p:${isD('path')}, a:${isD('page')}, f:${isD('filters')}, c:${isD('cust')}`);

    if (isD('url')) {
      this.openWebPlayer(this.form.get('url').value, this.form.get('path').value, _.omit(this.form.get('cust').value, v => !v));
    } else if (isD('path') || isD('filters') || isD('cust')) {
      this.path = isD('path') ? this.form.get('path').value : this.path;
      this.page = isD('page') ? this.form.get('page').value : this.page;
      this.customization = _.omit(this.form.get('cust').value, v => !v);
      this.pages = [];
      const allFilters: Array<SpotfireFilter> = [];
      _.each(this.form.get('filters').value, (flt, dataTableName) => {
        _.each(flt, (values, dataColumnName) => {
          allFilters.push(new SpotfireFilter({
            dataTableName: dataTableName,
            dataColumnName: dataColumnName,
            filterSettings: { values: values }
          }));
        });
      });
      this.filters = allFilters;
      if (this.sid) {
        this.localStorageService.set(`${this.sid}.url`, this.form.get('url').value);
        this.localStorageService.set(`${this.sid}.path`, this.form.get('path').value);
        this.localStorageService.set(`${this.sid}.page`, this.form.get('page').value);
        this.localStorageService.set(`${this.sid}.cust`, this.customization);
        this.localStorageService.set(`${this.sid}.flts`, this.filters);
      }
      this.openPath(this.path);
    } else if (isD('page')) {
      // if only page has changed, just refresh it
      //
      if (this.sid) {
        this.localStorageService.set(`${this.sid}.page`, this.form.get('page').value);
      }
      this.openPage(this.form.get('page').value);
    }
  }
  ngAfterViewInit() {
    this.setFlts();
    if (this.sid) {
      if (this.localStorageService.get(`${this.sid}.path`)) {
        this.path = this.localStorageService.get(`${this.sid}.path`);
      }
      if (this.localStorageService.get(`${this.sid}.cust`)) {
        this.customization = this.localStorageService.get(`${this.sid}.cust`);
      }
      if (this.localStorageService.get(`${this.sid}.cust`)) {
        this.customization = this.localStorageService.get(`${this.sid}.cust`);
      }
      if (this.localStorageService.get(`${this.sid}.flts`)) {
        this.filters = this.localStorageService.get(`${this.sid}.flts`);
      }
    }
    console.log('-----> ', this.path, this.page, 'has markingEvent:', this.markingEvent.observers.length > 0);
    console.log('-----> ', this.path, this.page, 'has filterEvent:', this.filteringEvent.observers.length > 0);


    if (typeof this.customization === 'string') {
      this.customization = new SpotfireCustomization(JSON.parse(this.customization));
    } else {
      this.customization = new SpotfireCustomization(this.customization);
    }

    this.form = this.fb.group({
      url: [this.url, Validators.required],
      path: [this.path, Validators.required],
      page: this.fb.control({ value: this.page, disabled: !this.url }),
      cust: this.fb.group(this.customization),
      filters: this.fb.group({}),
      marking: this.fb.group({})
    });

    if (typeof this.markingOn === 'string') {
      this.markingOn = JSON.parse(this.markingOn);
    }
    if (!this.url || this.url.length === 0) {
      // this.displayErrorMessage('URL is missing');
      console.log(`Url attribute is not provided, flip the dashboard and display form!`);
      this.edit = true;
      this.metadata = new DocMetadata();
      return;
    }

    this.openWebPlayer(this.url, this.path, this.customization);
  }
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

  onCreateLoginElement = () => {
    console.log('Creating the login element');
    // Optionally create and return a div to host the login button
    this.displayErrorMessage('Cannot login');
    return null;
  }

  private updateMarking = (tName, mName, res) => {
    if (_.size(res) > 0) {
      console.log('[MARKING] un marking change', tName, mName, res);
      // update the marked row if partial selection
      //
      if (!this.markedRows[mName]) {
        this.markedRows[mName] = {};
      }
      if (!this.markedRows[mName][tName]) {
        this.markedRows[mName][tName] = res;
      } else {
        _.extend(this.markedRows[mName][tName], res);
      }
      //    console.log('[MARKING] on publie', this.markedRows);
      this.markerSubject.next(this.markedRows);
    } else if (this.markedRows[mName] && this.markedRows[mName][tName]) {
      // remove the marked row if no marking
      //
      //      console.log('[MARKING] remove marking change', this.markedRows[mName][tName]);
      delete this.markedRows[mName][tName];
      if (_.size(this.markedRows[mName]) === 0) {
        delete this.markedRows[mName];
      }
      this.markerSubject.next(this.markedRows);
    } else {
      console.log('[MARKING] rien a faire', tName, mName, res);
    }
  }
  private openWebPlayer(url: string, path: string, custo: SpotfireCustomization) {
    this.url = url;
    this.path = path;
    this.customization = custo;
    console.log(`SpotfireWrapperComponent openWebPlayer(${url})`);

    // lazy load the spotfire js API
    //
    setTimeout(() => {
      const sfLoaderUrl = `${this.url}/spotfire/js-api/loader.js`;
      this.service.loadJs(sfLoaderUrl).subscribe(() => {
        console.log(`Spotfire ${sfLoaderUrl} is LOADED !!!`, spotfire, this.page, this.spot.nativeElement, this.customization);
        if (spotfire) {
          this.openPath(this.path);
        } else {
          this.displayErrorMessage('Spotfire is not loaded');
        }
      }, err => this.displayErrorMessage(err));
    }, 1000);
  }
  private openPath(path: string) {
    this.path = path;
    console.log(`SpotfireWrapperComponent openPath(${path})`);
    // Create a Unique ID for this Spotfire dashboard
    //
    this.spot.nativeElement.id = this.sid ? this.sid : new Date().getTime();
    // Prepare Spotfire app with path/page/customization
    //
    this.app = new Application(this.url,
      this.customization, path, this.parameters, this.reloadAnalysisInstance,
      this.version, this.onReadyCallback, this.onCreateLoginElement);
  }

  private openPage(page: string) {
    console.log(`SpotfireWrapperComponent openPage(${page})`);
    this.page = page;
    // Ask Spotfire library to display this path/page (with optional customization)
    //
    if (!this.app) {
      throw new Error('Spotfire webapp is not created yet');
    }

    console.log('SpotfireService openDocument', this.spot.nativeElement.id, `cnf=${page}`, this.config, this.app, this.customization);
    // this.doc = this.app.openDocument(this.spot.nativeElement.id, page, this.customization);

    this.document = this.app.getDocument(this.spot.nativeElement.id, page, this.customization);
    this.document.getDocumentMetadata$().subscribe(g => this.metadata = g);
    /*  this.document.getDocumentProperties$().subscribe(g => console.log('--> getDocumentProperties', g));
      this.document.getPages$().subscribe(g => console.log('--> getPages', g));
      this.document.getBookmarks$().subscribe(g => console.log('--> getBookmarks', g));
      this.document.getBookmarkNames$().subscribe(g => console.log('--> getBookmarkNames', g));
      this.document.getReports$().subscribe(g => console.log('--> getReports', g));
      */
    this.document.getPages$().subscribe(f => this.pages = _.pluck(f, 'pageTitle'));
    this.document.getActivePage$().subscribe(g => this.form.get('page').patchValue(g.pageTitle));

    //   this.doc.exportActiveVisualAsImage(100, 200);
    // this.marking = this.document.marking;
    //  this.marking.getMarkingNames(g => console.log('SFINFO', 'getMarkingNames() = ', g));
    if (this.filters) {
      this.document.filtering.setFilters(this.filters);
      this.loadFilters();
      console.log('[SPOTFIRE] FILTER', this.filters, this.document.getFiltering());
    }

    // get Table info
    //
    this.document.data.getAllTables$().subscribe(tables => {
      console.log('getAllTables$ returns', tables, this.filters, this.markingOn);
      const toList = (g) => g.map(f => `'${f}'`).join(', '),
        errTxt1 = '[spotfire-wrapper] Attribut marking-on contains unknwon',
        errTxt2 = '[spotfire-wrapper] Possible values for',
        fil: FormGroup = this.form.get('filters') as FormGroup,
        mar: FormGroup = this.form.get('marking') as FormGroup,
        tNames = _.keys(tables),
        tdiff = this.markingOn ? _.difference(_.keys(this.markingOn), tNames) : [];
      console.log('Tables : ', tNames, tdiff, fil);

      if (_.size(tdiff) > 0) {
        this.errorMessages.push(`${errTxt1} table names: ${toList(tdiff)}`);
        this.possibleValues = `${errTxt2} table names are: ${toList(tNames)} `;
        //        return;
      }

      // Update marking and filters fields
      //
      _.each(tables, (columns, tname) => {
        mar.addControl(tname, new FormControl(this.markingOn ? this.markingOn[tname] : null));
        if (!fil.contains(tname)) {
          fil.addControl(tname, new FormGroup({}));
        }
        const frm: FormGroup = fil.get(tname) as FormGroup;
        const cNames = _.keys(columns);
        /*
        console.log('Columns : ', cNames, this.markingOn);
        if (this.markingOn) {
          const cdiff = this.markingOn[tname] ? _.difference(this.markingOn[tname], cNames) : [];
          console.log('Columns : ', cNames, cdiff);
          if (_.size(cdiff) > 0) {
            this.errorMessages.push(`${errTxt1} column names: ${toList(cdiff)}`);
            this.possibleValues = `${errTxt2} columns of table ${tname} are: ${toList(cNames)} `;
            //          return;
          }
        }
        */

        _.each(cNames, cname => {
          const flt = _.findWhere(this.filters, { dataTableName: tname, dataColumnName: cname });
          frm.addControl(cname, new FormControl(flt ? flt.filterSettings.values : null));
        });
      });

      if (this.markingOn) {
        this.document.marking.getMarkingNames$().subscribe(markingNames => _.each(markingNames, markingName => {
          _.each(this.markingOn, (xolumns: Array<string>, tName: string) => {
            if (xolumns.length === 1 && xolumns[0] === '*') {
              xolumns = _.keys(tables[tName]);
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

  private loadFilters() {
    if (this.isFilteringWiredUp) {
      const ALL = spotfire.webPlayer.includedFilterSettings.ALL_WITH_CHECKED_HIERARCHY_NODES;
      console.log('SpotfireComponent loadFilters', this.filterSubject);
      this.document.getFiltering().getAllModifiedFilterColumns(ALL, fs => this.filterSubject.next(fs));
    }
  }
}
