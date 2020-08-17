/*
* Copyright (c) 2019-2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { forkJoin, of as observableOf, throwError, zip, BehaviorSubject, Observable, TimeoutError } from 'rxjs';
import { catchError, filter, map, mergeMap, pluck, tap, timeout } from 'rxjs/operators';

import { SpotfireCustomization as Customization, SpotfireFilter } from './spotfire-customization';

declare let spotfire: any;

export const CUSTLABELS = {
  showAbout: 'Show the about menu item',
  showAnalysisInformationTool: 'Show the analysis information tool menu item',
  showAuthor: 'Show the button for enabling authoring',
  showClose: 'Show the analysis close menu item',
  showCustomizableHeader: 'Show the customizable header',
  showDodPanel: 'Show the details on demand panel in the visualization.',
  showExportFile: 'Show the export file menu item',
  showFilterPanel: 'Show the filter panel.',
  showHelp: 'Show the help menu item',
  showLogout: 'Show the logout menu item',
  showPageNavigation: 'Show the page navigation controls in the analysis',
  showStatusBar: 'Show status bar in the Web Player',
  showToolBar: 'Show the analysis toolbar and menu',
  showUndoRedo: 'Show the undo/redo menu item'
};

function doConsole(...args: any[]) {
  // console.log('[SPOTFIRE-WEBPLAYER]', ...args);
}
class PageState { index: number; pageTitle: string; }
class DataTable { dataTableName: string; }
class DataColumn { dataColumnName: string; dataTableName: string; dataType: string; values: {}; }
class DistinctValues { count: number; values: Array<string>; }

export class Marking {
  constructor(public _marking) { }
  getMarkingNames$ = () => doCall<string[]>(this._marking, 'getMarkingNames');
  onChanged$ = (m, t, c, n) => doCall(this._marking, 'onChanged', m, t, c, n);
}

/**
 * @description
 * Class holder to provide filtering features outside of the dashboard.
 * On Angular side, the onFiltering output parameter has to be set like this:
 *    <spotfire-wrapper
 *       (filtering)="onFiltering($event)"
 *       ...
 *    </spotfire-wrapper>
 *    ...
 *    import { SpotfireFiltering } from '@tibco/spotfire-wrapper';
 *    ...
 *    filtering: SpotfireFiltering = null;
 *    onFiltering = (e: SpotfireFiltering) => this.filtering = e;
 *    getSchemes = () => this.filtering.getFilteringSchemes$()
 *         .subscribe(schemes => console.log('My Schemes', schemes));
 */
export class SpotfireFiltering {
  constructor(private _filtering) { }
  setFilters = (flts) => this._filtering.setFilters(flts, spotfire.webPlayer.filteringOperation.REPLACE);
  resetAllFilters = () => this._filtering.resetAllFilters();
  getAllModifiedFilterColumns$ = () => doCall<SpotfireFilter[]>(
    this._filtering, 'getAllModifiedFilterColumns',
    spotfire.webPlayer.includedFilterSettings.ALL_WITH_CHECKED_HIERARCHY_NODES
  )
  getFilteringScheme$ = (filteringSchemeName: string) => doCall<FillteringScheme>(
    this._filtering, 'getFilteringScheme', filteringSchemeName)
  getFilteringSchemes$ = () => doCall<FillteringScheme>(
    this._filtering, 'getFilteringSchemes')
  getActiveFilteringScheme$ = () => doCall<FillteringScheme[]>(
    this._filtering, 'getActiveFilteringScheme')
}

class FillteringScheme {
  filteringSchemeName: string;
  dataTables: DataTable[];
}

export class SpotfireParameters {
  url: string;
  path: string;
  page: string | number;
  domid: string;
  sid: string;
  customization: Customization;
  version = '7.14'; // Nominal fall back value
  debug = false;
  reloadAnalysisInstance = false;
  document: Document;
  app: any;
  _parameters: string;
  constructor(vars?: {}) {
    if (vars) {
      Object.keys(vars).forEach(key => this[key] = vars[key]);
    }
    // Create a Unique ID for this Spotfire dashboard
    //
    this.domid = this.domid ? this.domid : this.sid ? `${this.sid}` : `${new Date().getTime()}`;
  }
}

export class Data {
  allTables = {};
  constructor(private _data) { }

  getTables$ = () => this.getDataTables$().pipe(
    mergeMap(tables => {
      const obs = [];
      tables.forEach(table => obs.push(this.getDataTableColNames$(table.dataTableName)));
      return forkJoin(obs);
    }),
    map(k => {
      let z = {};
      k.forEach((p: {}) => z = { ...z, ...p });
      return z;
    })
  )
  getAllTables$ = () => this.getDataTables$().pipe(
    mergeMap(tables => {
      const obs = [];
      tables.forEach(table => obs.push(this.getDataTable$(table.dataTableName)));
      return forkJoin(obs);
    }), map(tables => {
      const dataTables = [];
      (tables[0] as []).forEach(columns => {
        const tname = columns['tabName'];
        if (!dataTables[tname]) { dataTables[tname] = {}; }
        dataTables[tname][columns['colName']] = columns['vals'];
      });
      return dataTables;
    }))

  // A Spotfire analysis contains one or more data tables, retrieved by the getDataTable,
  // getActiveDataTable and getDataTables methods.
  private getDataTables$ = () => doCall<DataTable[]>(this._data, 'getDataTables');

  private getDataTableColNames$ = (t) => doCall<DataTable>(this._data, 'getDataTable', t)
    .pipe(mergeMap(f => this.getDataColumns$(f)), map(d => ({ [t]: d })))

  private getDataTable$ = (t) => doCall<DataTable>(this._data, 'getDataTable', t)
    .pipe(mergeMap(f => this.getDataColumns$(f)))

  // Each data table contains one or more data columns, retrieved by the getDataColumn,
  // getDataColumns and searchDataColumns.
  private getDataColumns$ = (t) => doCall<DataColumn[]>(t, 'getDataColumns').pipe(
    mergeMap(columns => {
      const obs = [];
      columns.forEach((col: DataColumn) => obs.push(zip(...[observableOf(col)], (a: DataColumn, b) => a.dataColumnName)));
      return forkJoin(obs);
    })
  )

  // From the DataColumn class it is possible to retrieve metadata, such as column name and data type.
  // It is also possible to get a list of the unique values in the data column with the getDistinctValues method.
  private getDistinctValues$ = (t: DataColumn) => doCall<DistinctValues>(t, 'getDistinctValues', 0, 20).pipe(
    tap(g => doConsole('Data.DistinctValues$', t, g, g.count > 0 && g.count < 25)),
    // filter(g => g.count > 0 && g.count < 25),
    //  tap(g => doConsole('[OBS]', 'DistinctValues filtres', g)),
    pluck('values'))
}

export class DocMetadata {
  size: number;
  sizeUnit = 'B';
  contentSize: number;
  created: Date;
  description: string;
  lastModified: Date;
  path: string;
  title: string;

  constructor(p?) {
    if (p) {
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
}

export class Document {
  private _doc;
  private marking: Marking;
  private filtering: SpotfireFiltering;
  private data: Data;
  constructor(app, id, page, custo) {
    this._doc = app.openDocument(id, page, custo);
    app.onOpened$().subscribe(doc => {
      doConsole(`Document.onOpened$: page is now opened:`, doc);
      this._doc = doc;
      // Register event handler for page change events.
      this.onActivePageChanged$().subscribe(this.onActivePageChangedCallback);
      this.marking = new Marking(this._doc.marking);
      this.filtering = new SpotfireFiltering(this._doc.filtering);
      this.data = new Data(this._doc.data);
    });
  }
  init$(app): Observable<Document> {
    return app.onOpened$().pipe(map((doc: Document) => {
      this._doc = doc;
      // Register event handler for page change events.
      this.onActivePageChanged$().subscribe(this.onActivePageChangedCallback);
      this.marking = new Marking(this._doc.marking);
      this.filtering = new SpotfireFiltering(this._doc.filtering);
      this.data = new Data(this._doc.data);
      return this;
    }));
  }
  getData() {
    doConsole(`Document.getData: a)`, JSON.stringify(this.data));
    if (!this.data) {
      this.marking = new Marking(this._doc.marking);
      this.filtering = new SpotfireFiltering(this._doc.filtering);
      this.data = new Data(this._doc.data);
    }
    doConsole(`Document.getData: b)`, JSON.stringify(this.data));
    return this.data;
  }
  getDocumentMetadata$ = (): Observable<DocMetadata> => this.do<DocMetadata>('getDocumentMetadata').pipe(map(g => new DocMetadata(g)));
  getPages$ = () => this.do('getPages').pipe(map(m => Object.keys(m).map(f => m[f].pageTitle)));
  // getDocumentProperties$ = () => this.do('getDocumentProperties');
  // getBookmarks$ = () => this.do('getBookmarks');
  // getBookmarkNames$ = () => this.do('getBookmarkNames');
  // getReports$ = () => this.do('getReports');
  getActivePage$ = () => this.do<PageState>('getActivePage');
  setActivePage = (p: string | number) => this._doc.setActivePage(p);
  // getData = () => this.data;
  getMarking = () => this.marking;
  getFiltering = () => this.filtering;
  _d = () => this._doc ? this._doc : null;
  onDocumentReady$ = () => doCall(this._doc, 'onDocumentReady');
  close = () => this._doc ? this._doc.close() : null;
  private onActivePageChangedCallback = (pageState) => doConsole('onActivePageChangedCallback', pageState);
  private do = <T>(m: string) => doCall<T>(this._doc, m);
  private onActivePageChanged$ = () => doCall(this._doc, 'onActivePageChanged');
}

/**
 * @description
 * Class holder to provide export features outside of the dashboard.
 * On Angular side, the onReporting output parameter has to be set like this:
 *    <spotfire-wrapper
 *       (reporting)="onReporting($event)"
 *       ...
 *    </spotfire-wrapper>
 *    ...
 *    import { SpotfireReporting } from '@tibco/spotfire-wrapper';
 *    ...
 *    reporting: SpotfireReporting = null;
 *    onReporting = (e: SpotfireReporting) => this.reporting = e;
 *    exportAsImage = () => this.reporting.exportActiveVisualAsImage();
 */
export class SpotfireReporting {
  private exp;
  constructor(doc: Document) {
    this.exp = doc._d();
  }
  /** Launch the print wizard. */
  print = () => this.exp.print();
  /** Launch the export to PowerPoint wizard. */
  exportToPowerPoint = () => this.exp.exportToPowerPoint();
  /** Launch the export to Pdf wizard. */
  exportToPdf = () => this.exp.exportToPdf();
  /** Exports the report, specified by name, to PDF. */
  exportReport = (reportName: string) => this.exp.exportReport(reportName);
  /** Get the names of the reports in the analysis. */
  getReports = (callback) => this.exp.getReports(callback);
  /** Export the active visual as image. The image will be opened in a new browser tab or window. */
  exportActiveVisualAsImage = (width = 800, height = 600) => this.exp.exportActiveVisualAsImage(width, height);
}

/**
 * @description
 * An observable object that decribes the status of the TIBCO Spotfire Server.
 */
export class SpotfireServer {
  isOnline: boolean;
  serverUrl: string;
  statusMessage: string;
  constructor(serverUrl: string, isOnline: boolean) {
    this.isOnline = isOnline;
    this.serverUrl = serverUrl;
  }
}

/**
 * @description
 * Turn async calls into Observables.
 *
 * For methods which name starts with 'on', the observable continues providing data it's received.
 * Otherwise the observable stops sending data at first buffer received.
 * An error is raised when the 50min timeout expires.
 *
 * @param obj the object against we call method
 * @param m the name of method
 * @param ...a list of arguments to be sent along with the method
 *
 * @return Observable<T> an observable that corresponds to the original callback
 *
 */
function doCall<T>(obj, m: string, ...a: any[]): Observable<T> {
  doConsole('doCall -->', obj, m, a);
  return new Observable<T>(observer => {
    const oneShot = ['onDocumentReady'];
    // doConsole('[OBS]', 'doCall obj=', obj, ', m=', m, ', arg=', args, typeof obj);
    if (typeof obj[m] !== 'function' || !obj) {
      console.error('[OBS]', `function '${m}' does not exist on `, obj);
      observer.error(`function '${m}' does not exist on objet ${JSON.stringify(obj)}`);
    }
    try {
      // doConsole('[OBS]', `Call ${m}(${a.join(',')})`, a.length);
      const q = (g: T) => observer.next(g);
      const p = (g: T) => { observer.next(g); observer.complete(); };
      return m.startsWith('on') && oneShot.indexOf(m) === -1 ? obj[m](...a, q) : obj[m](...a, p);
    } catch (err) {
      console.warn('[OBS]', 'doCall erreur: ', err);
      observer.error(err);
    }
  }).pipe(
    timeout(3001000),
    catchError(e => {
      if (e instanceof TimeoutError) {
        console.error(`[SPOTFIRE-WEBPLAYER] The call ${m}(${a.join(',')}) does not answer after 3001sec on ${JSON.stringify(obj)}`);
      } else {
        console.error('[SPOTFIRE-WEBPLAYER] ERROR on doCall', e);
      }
      return throwError(e);
    }));
}

export class Application {
  private readySubject = new BehaviorSubject<boolean>(false);
  // tslint:disable-next-line:member-ordering
  onApplicationReady$ = this.readySubject.asObservable().pipe(filter(d => d));
  private _app: any;

  constructor(
    public url: string,
    public customization: Customization,
    public path: string,
    public parameters: string,
    public reloadAnalysisInstance: boolean,
    public version: string,
    public onCreateLoginElement) {
    this._app = new spotfire.webPlayer.createApplication(this.url,
      this.customization, this.path, this.parameters, this.reloadAnalysisInstance,
      this.version, this.onReadyCallback, this.onCreateLoginElement);
  }
  onOpened$ = () => doCall(this._app, 'onOpened');
  getDocument$ = (id: string, page: string | number, custo?: Customization): Observable<Document> => {
    const doc = new Document(this, id, page, custo ? custo : this.customization);
    return doc.init$(this);
  }
  openDocument = (id: string, page: string | number, custo: Customization) => this._app.openDocument(id, page, custo);

  private onReadyCallback = (response, newApp: Application) => {
    doConsole('Application.onReadyCallback', response, newApp);
    this._app = newApp;
    // Register an error handler to catch errors.
    this._app.onError(this.onErrorCallback);
    if (response.status === 'OK') {
      // The application is ready, meaning that the api is loaded and that the analysis path
      // is validated for the current session(anonymous or logg ed in user)
      this.readySubject.next(true);
      this.readySubject.complete();
    } else {
      const errMsg = `Status not OK. ${response.status}: ${response.message}`;
      console.error('[SPOTFIRE-WEBPLAYER] Application.onReadyCallback', errMsg, response);
      this.readySubject.error(errMsg);
    }
  }
  // Displays an error message if something goes wrong in the Web Player.
  private onErrorCallback = (errCode: string, desc: string) => console.error(`[SPOTFIRE-WEBPLAYER] ${errCode}: ${desc}`);
}
