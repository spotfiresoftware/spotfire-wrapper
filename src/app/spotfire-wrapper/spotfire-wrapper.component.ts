// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import {
  Component, Input, AfterViewInit, EventEmitter, ViewChild,
  ElementRef, Output, OnChanges, SimpleChanges, ViewEncapsulation, Renderer2
} from '@angular/core';

import * as _ from 'underscore';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { LazyLoadingLibraryService } from './lazy-loading-library.service';
import { SpotfireCustomization, SpotfireFilter } from './spotfire-customization';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { LocalStorageService } from 'angular-2-local-storage';

// https://community.tibco.com/wiki/tibco-spotfire-javascript-api-overview
// https://community.tibco.com/wiki/mashup-example-multiple-views-using-tibco-spotfire-javascript-api

class DocMetadata {
  contentSize: number;
  size: number;
  sizeUnit = 'B';

  created: Date;
  description: string;
  lastModified: Date;
  path: string;
  title: string;
  constructor(p) {
    this.contentSize = parseInt(p['contentSize'], 10);
    if (this.contentSize > (1024 * 1024)) {
      this.size = this.contentSize / (1024 * 1024);
      this.sizeUnit = 'MB';
    } else if (this.contentSize > 1024) {
      this.size = this.contentSize / 1024;
      this.sizeUnit = 'KB';
    }
    this.created = new Date(p.created);
    this.lastModified = new Date(p.lastModified);
    this.description = p.description;
    this.path = p.path;
    this.title = p.title;
  }
}

declare let spotfire: any;
const _SPOTFIRE = typeof spotfire === 'undefined' ? false : spotfire;

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
  @Input() path = 'Homepage';
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

  // Optional configuration settings;
  // private filteringSchemeName = '';
  private app: any;

  private filtering: any;
  private filterSubject = new BehaviorSubject<Array<{}>>([]);
  public filter$: Observable<Array<{}>> = this.filterSubject.asObservable();
  @Output() filteringEvent: EventEmitter<any> = new EventEmitter(false);

  private marking: any;
  private markerSubject = new BehaviorSubject<{}>({});
  public marker$: Observable<{}> = this.markerSubject.asObservable();
  @Output() markingEvent: EventEmitter<any> = new EventEmitter(false);
  public dataTables = {};
  private markedRows = {};
  private data: any;
  public SPOTFIRE = _SPOTFIRE;

  view: any;
  longTime = false;
  shows = ['showAbout', 'showAnalysisInformationTool', 'showAuthor', 'showClose', 'showCustomizableHeader', 'showDodPanel',
    'showExportFile', 'showExportVisualization', 'showFilterPanel', 'showHelp', 'showLogout', 'showPageNavigation',
    'showAnalysisInfo', 'showReloadAnalysis', 'showStatusBar', 'showToolBar', 'showUndoRedo'];
  constructor(private renderer: Renderer2, private localStorageService: LocalStorageService,
    private fb: FormBuilder, private service: LazyLoadingLibraryService) {
    setTimeout(() => this.longTime = true, 6000);
    console.log('SPOT URL', this.url, 'CUST=', this.customization, typeof this.filters, 'FILTERS=', this.filters);
  }
  stopPropagation = (e) => e.stopPropagation();

  private get isMarkingWiredUp() { return this.markingEvent.observers.length > 0; }
  private get isFilteringWiredUp() { return this.filteringEvent.observers.length > 0; }
  displayErrorMessage = (message: string, withIframe = true) => {
    console.error('ERROR:', message);
    setTimeout(() => {
      if (message) {
        this.errorMessages.push(message);
      }
      if (withIframe) {
        const iframe = this.renderer.createElement('iframe');
        this.renderer.setAttribute(iframe, 'src', `${this.url}/login.html`);
        this.renderer.setAttribute(iframe, 'allowfullscreen', 'true');
        this.renderer.setAttribute(iframe, 'title', `${this.url}`);
        this.renderer.setStyle(iframe, 'border', '0');
        this.renderer.setStyle(iframe, 'width', '100%');
        this.renderer.setStyle(iframe, 'height', '600px');
        this.renderer.appendChild(this.spot.nativeElement, iframe);
      } else {
        const div = this.renderer.createElement('div');
        const text = this.renderer.createText(message);
        const span = this.renderer.createElement('span');
        const clear = this.renderer.createElement('span');
        // const br = this.renderer.createElement('br');
        const link = this.renderer.createElement('a');
        const lien = this.renderer.createText(`Open Spotfire`);

        this.renderer.appendChild(link, lien);
        this.renderer.setAttribute(link, 'target', 'other_frame');
        this.renderer.setAttribute(link, 'title', `Visit ${this.url} in an other tab`);
        this.renderer.setAttribute(link, 'href', this.url);
        this.renderer.appendChild(span, text);

        this.renderer.appendChild(div, span);
        this.renderer.appendChild(div, link);
        this.renderer.appendChild(div, clear);

        this.renderer.setStyle(span, 'line-height', '2');

        this.renderer.setStyle(link, 'border', '1px solid #062e79');
        this.renderer.setStyle(link, 'border-radius', '8px');
        this.renderer.setStyle(link, 'background', '#0081cb');
        this.renderer.setStyle(link, 'color', 'white');
        this.renderer.setStyle(link, 'padding', '5px 10px');
        this.renderer.setStyle(link, 'text-decoration', 'none');

        this.renderer.setStyle(clear, 'clear', 'both');

        this.renderer.setStyle(div, 'border', '2px dashed salmon');
        this.renderer.setStyle(div, 'padding', '20px');
        this.renderer.setStyle(div, 'margin', '20px');
        this.renderer.setStyle(div, 'font-family', 'monospace');
        this.renderer.setStyle(div, 'display', 'flex');
        this.renderer.setStyle(div, 'justify-content', 'space-between');
        this.renderer.appendChild(this.spot.nativeElement, div);
      }
    }, 0);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.app && changes.page) {
      console.log('CHANGE', changes);
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
    const c = _.omit(this.form.getRawValue(), (v, k: string) => !k.startsWith('show') || !v);
    if (this.customization !== c ||
      this.path !== this.form.get('path').value || true) {
      this.customization = c;
      this.pages = [];
      const allFilters: Array<SpotfireFilter> = [];
      _.each(this.form.get('filters').value, (filter, dataTableName) => {
        _.each(filter, (values, dataColumnName) => {
          allFilters.push(new SpotfireFilter({
            dataTableName: dataTableName,
            dataColumnName: dataColumnName,
            filterSettings: { values: values }
          }));
        });
      });
      this.filters = allFilters;
      if (this.sid) {
        this.localStorageService.set(`${this.sid}.path`, this.form.get('path').value);
        this.localStorageService.set(`${this.sid}.page`, this.form.get('page').value);
        this.localStorageService.set(`${this.sid}.cust`, c);
        this.localStorageService.set(`${this.sid}.flts`, this.filters);
      }
      this.openPath(this.form.get('path').value);
    } else if (this.page !== this.form.get('page').value) {

      if (this.sid) {
        this.localStorageService.set(`${this.sid}.page`, this.form.get('page').value);
      }
      this.openPage(this.form.get('page').value);
    }
    this.path = this.form.get('path').value;
    this.page = this.form.get('page').value;
    this.edit = false;
    e.stopPropagation();
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

    if (!this.url || this.url.length === 0) {
      this.displayErrorMessage('URL is missing');
      console.error(`Url attribute must be provided!`);
      return;
    }

    if (typeof this.customization === 'string') {
      this.customization = new SpotfireCustomization(JSON.parse(this.customization));
    } else {
      this.customization = new SpotfireCustomization(this.customization);
    }


    this.form = this.fb.group({
      page: this.page, path: this.path,
      showAbout: this.customization.showAbout,
      showAnalysisInformationTool: this.customization.showAnalysisInformationTool,
      showAuthor: this.customization.showAuthor, // this enable 'edit' button.
      showClose: this.customization.showClose,
      showCustomizableHeader: this.customization.showCustomizableHeader,
      showDodPanel: this.customization.showDodPanel, // Details-on-Demand panel
      showExportFile: this.customization.showExportFile,
      showExportVisualization: this.customization.showExportVisualization,
      showFilterPanel: this.customization.showFilterPanel,
      showHelp: this.customization.showHelp,
      showLogout: this.customization.showLogout,
      showPageNavigation: this.customization.showPageNavigation,
      showAnalysisInfo: this.customization.showAnalysisInfo,
      showReloadAnalysis: this.customization.showReloadAnalysis,
      showStatusBar: this.customization.showStatusBar,
      showToolBar: this.customization.showToolBar,
      showUndoRedo: this.customization.showUndoRedo,
      filters: this.fb.group({})
    });


    if (typeof this.markingOn === 'string') {
      this.markingOn = JSON.parse(this.markingOn);
    }
    // lazy load the spotfire js API
    //
    setTimeout(() => {
      const sfLoaderUrl = `${this.url}/spotfire/js-api/loader.js`;
      this.service.loadJs(sfLoaderUrl).subscribe(() => {
        console.log(`Spotfire ${sfLoaderUrl} is LOADED !!!`, spotfire);
        this.SPOTFIRE = spotfire;
        console.log('SpotfireComponent', this.page, this.spot.nativeElement, this.customization);
        if (this.SPOTFIRE) {
          this.openPath(this.path);
        } else {
          this.displayErrorMessage('Spotfire is not loaded');
        }
      }, err => this.displayErrorMessage(err));
    }, 1000);
  }
  onReadyCallback = (response, newApp) => {
    this.app = newApp;
    if (response.status === 'OK') {
      // The application is ready, meaning that the api is loaded and that the analysis path
      // is validated for the current session(anonymous or logged in user)
      this.openPage(this.page);
    } else {
      const errMsg = `Status not OK. ${response.status}: ${response.message}`;
      console.log(errMsg);
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
  private openPath(path: string) {
    // Create a Unique ID for this Spotfire dashboard
    //
    this.spot.nativeElement.id = this.sid ? this.sid : new Date().getTime();
    // Prepare Spotfire app with path/page/customization
    //
    this.app = new this.SPOTFIRE.webPlayer.createApplication(
      this.url,
      this.customization,
      path,
      this.parameters,
      this.reloadAnalysisInstance,
      this.version,
      this.onReadyCallback,
      this.onCreateLoginElement);

  }
  private openPage(page: string) {
    console.log('SpotfireCmp openPage', page, this.filters);
    this.page = page;
    // Ask Spotfire library to display this path/page (with optional customization)
    //
    if (!this.app) {
      throw new Error('Spotfire webapp is not created yet');
    }

    console.log('SpotfireService openDocument', this.spot.nativeElement.id, `cnf=${page}`, this.config, this.app, this.customization);
    const doc = this.app.openDocument(this.spot.nativeElement.id, page, this.customization);
    doc.getDocumentMetadata(g => this.metadata = new DocMetadata(g));
    doc.getPages(f => this.pages = _.pluck(f, 'pageTitle'));

    this.marking = doc.marking;
    //  this.marking.getMarkingNames(g => console.log('SFINFO', 'getMarkingNames() = ', g));
    this.data = doc.data;
    if (this.isFilteringWiredUp) {
      this.filtering = doc.filtering;
      this.filtering.setFilters(this.filters, this.SPOTFIRE.webPlayer.filteringOperation.REPLACE);
      this.loadFilters();
      console.log('[SPOTFIRE] FILTER', this.filters, this.filtering);

      // Subscribe to filteringEvent and emit the result to the Output if filter panel is displayed
      //
      this.filter$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(f => this.filteringEvent.emit(f));
    }

    // get Table info
    //
    this.data.getDataTables(tables => {
      _.each(tables, table => {
        const fil: FormGroup = this.form.get('filters') as FormGroup;
        this.data.getDataTable(table['dataTableName'], dataTable => dataTable.getDataColumns(d => {
          console.log('SFINFO', `getDataTable(${table['dataTableName']}`, d);
          //      this.dataTables[table['dataTableName']] = {};
          // only get the values of String columns, and only those which have less than 21 possible values
          _.each(d, r => {
            if (r.dataType === 'String') {
              r.getDistinctValues(0, 25, vals => {
                console.log('SFINFO', 'getDistinctValues', r, vals);
                if (vals.count > 1 && vals.count < 20) {
                  if (!this.dataTables[table['dataTableName']]) {
                    this.dataTables[table['dataTableName']] = {};
                  }
                  const flt = _.find(this.filters, f =>
                    f.dataTableName === table['dataTableName'] && f.dataColumnName === r.dataColumnName);
                  if (!fil.contains(table['dataTableName'])) {
                    fil.addControl(table['dataTableName'], new FormGroup({}));
                  }
                  const fil2: FormGroup = fil.get(table['dataTableName']) as FormGroup;
                  fil2.addControl(r.dataColumnName, new FormControl(flt ? flt.filterSettings.values : null));
                  this.dataTables[table['dataTableName']][r.dataColumnName] = vals.values;
                }
              });
            }
          });
        }));
      });
    });
    if (this.isMarkingWiredUp) {
      this.marker$.subscribe(f => {
        console.log('J\'emet', f);
        this.markingEvent.emit(f);
      });

      // this.data.getActiveDataTable(d => console.log('openPage.getActiveDataTable', d));
      if (this.markingOn) {
        this.data.getDataTables(tables => {
          const tNames = _.pluck(tables, 'dataTableName');
          const tdiff = _.difference(_.keys(this.markingOn), tNames);

          if (_.size(tdiff) > 0) {
            this.errorMessages.push(`[spotfire-wrapper] Attribut marking-on contains unknwon table names: ${tdiff
              .map(f => `'${f}'`).join(', ')}`);
            this.possibleValues = `[spotfire-wrapper] Possible values for table names are: ${tNames
              .map(f => `'${f}'`).join(', ')} `;
            return;
          }
          _.each(tables, table => {
            this.data.getDataTable(table['dataTableName'], dataTable => dataTable.getDataColumns(d => {
              const cNames = _.pluck(d, 'dataColumnName');
              const cdiff = _.difference(this.markingOn[table['dataTableName']], cNames);
              if (_.size(cdiff) > 0) {
                this.errorMessages.push(`[spotfire-wrapper] Attribut marking-on contains unknwon column names: ${cdiff
                  .map(f => `'${f}'`).join(', ')}`);
                this.possibleValues = `[spotfire-wrapper] Possible values for columns of table ${table['dataTableName']} are: ${cNames
                  .map(f => `'${f}'`).join(', ')} `;
                return;
              }
              this.marking.getMarkingNames(markingNames => _.each(markingNames, markingName => {
                console.log('[MARKING] * MARKINGNAMES', markingNames);
                _.each(this.markingOn, (columns: Array<string>, tName: string) => {
                  console.log(`[MARKING] * register ${markingName}.${tName} `, columns);
                  this.marking.onChanged(markingName, tName, columns, this.maxRows, res => this.updateMarking(tName, markingName, res));
                });
              }));
            }));
          });
        });
      } else {
        // for each table
        //
        this.data.getDataTables(tables => {
          console.log('[MARKING] openPage.getDataTables', tables);
          _.each(tables, table => {
            table['getDataColumns'](cols => console.log(` - openPage.getDataTable(${table['dataTableName']}).getDataColumns`, cols));
            this.data.getDataTable(table['dataTableName'], dataTable => {

              // for each column
              //
              dataTable.getDataColumns(d => {
                console.log(`${table['dataTableName']}.getDataColumns`, _.pluck(d, 'dataColumnName'));
                this.marking.getMarkingNames(markingNames => {

                  // for each marking
                  //
                  _.each(markingNames, markingName => {
                    const columns = ['Volume', 'DATE', 'BRAND_NM', 'CHNL_GROUP'];
                    // const columns = _.pluck(d, 'dataColumnName');
                    console.log(`[MARKING] register ${markingName}.${table['dataTableName']} `, columns);
                    this.markedRows[markingName] = {};
                    this.marking.onChanged(markingName, table['dataTableName'], columns, this.maxRows, res => {
                      this.updateMarking(table['dataTableName'], markingName, res);

                    });
                  });

                });
              });
            });
          });
        });
      }
      // Subscribe to markingEvent and emit the result to the Output
      //
      //      this.marker$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(f => this.markingEvent.emit(f));
    }
  }

  private loadFilters() {
    const ALL = this.SPOTFIRE.webPlayer.includedFilterSettings.ALL_WITH_CHECKED_HIERARCHY_NODES;
    console.log('SpotfireComponent loadFilters', this.filterSubject);
    this.filtering.getAllModifiedFilterColumns(ALL, fs => this.filterSubject.next(fs));
  }
}
