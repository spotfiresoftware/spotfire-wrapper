
// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import { Observable, forkJoin, of as observableOf } from 'rxjs';
import { SpotfireCustomization } from './spotfire-customization';
import { mergeMap, tap, pluck, map, filter } from 'rxjs/operators';
import * as _ from 'underscore';

declare let spotfire: any;

export const CUSTLABELS = {
  showAbout: 'Show the about menu item',
  showAnalysisInformationTool: 'Show the analysis information tool menu item',
  showAuthor: 'Show the button for enabling authoring',
  showClose: 'Show the analysis close menu item',
  showCustomizableHeader: 'Show the customizable header',
  showDodPanel: 'Show the details on demand panel in the visualization.',
  showExportFile: 'Show the export file menu item',
  showExportVisualization: 'Show the export visualization menu item',
  showFilterPanel: 'Show the filter panel.',
  showHelp: 'Show the help menu item',
  showLogout: 'Show the logout menu item',
  showPageNavigation: 'Show the page navigation controls in the analysis',
  showReloadAnalysis: 'Show the Reload analysis button in the toolbar',
  showStatusBar: 'Show status bar in the Web Player',
  showToolBar: 'Show the analysis toolbar and menu',
  showUndoRedo: 'Show the undo/redo menu item'
};

class PageState { index: number; pageTitle: string; }
class DataTable { dataTableName: string; }
class DataColumn { dataColumnName: string; dataTable: string; dataType: string; }
class DistinctValues { count: number; values: Array<string>; }


function doCall<T>(obj, meth: string, ...args): Observable<T> {
  return Observable.create(observer => {
    // console.log('[OBS]', 'doCall obj=', obj, ', meth=', meth, ', arg=', args, typeof obj);
    if (typeof obj[meth] !== 'function') {
      console.error('[OBS]', 'pas de ', meth, 'sur ', obj);
      observer.error(`pas de function ${meth} sur l'objet ${JSON.stringify(obj)}`);
    }
    if (!obj) {
      observer.error(`No object to call ${meth} `);
    }
    try {
      // console.log('[OBS]', `Call ${meth}(${args.join(',')})`, args.length);
      const p = (g: T) => { observer.next(g); observer.complete(); };
      const q = (g: T) => observer.next(g);
      switch (args.length) {
        case 0: return meth.startsWith('on') ? obj[meth]((g: T) => q(g)) : obj[meth]((g: T) => p(g));
        case 1: return meth.startsWith('on') ? obj[meth](args[0], (g: T) => q(g)) : obj[meth](args[0], (g: T) => p(g));
        case 2: return meth.startsWith('on') ? obj[meth](args[0], args[1], (g: T) => q(g)) : obj[meth](args[0], args[1], (g: T) => p(g));
        case 3: return meth.startsWith('on') ? obj[meth](args[0], args[1], args[2], (g: T) => q(g)) :
          obj[meth](args[0], args[1], args[2], (g: T) => p(g));
        case 4: return meth.startsWith('on') ? obj[meth](args[0], args[1], args[2], args[3], (g: T) => q(g)) :
          obj[meth](args[0], args[1], args[2], args[3], (g: T) => p(g));
        default: observer.error(`Call ${meth}(${args.join(',')}) pb arguments`);
      }
    } catch (err) {
      console.warn('[OBS]', 'doCall erreur: ', err);
      observer.error(err);
    }
  });
}

export class Application {
  private _app;
  private doc: Document;
  constructor(
    public url: string,
    public customization: SpotfireCustomization | string,
    public path: string,
    public parameters: string,
    public reloadAnalysisInstance: boolean,
    public version: string,
    public onReadyCallback,
    public onCreateLoginElement) {
    console.log('Application constructor');
    this._app = new spotfire.webPlayer.createApplication(this.url,
      this.customization, this.path, this.parameters, this.reloadAnalysisInstance,
      this.version, this.onReadyCallback, this.onCreateLoginElement);
  }
  setApp = (a) => this._app = a;

  public getDocument(id, page, custo?): Document {
    custo = custo ? custo : this.customization;
    console.log('Application getDocument');
    this.doc = new Document(this._app, id, page, this.customization);
    return this.doc;
  }
}

export class Document {
  private _doc;
  marking: Marking;
  filtering: Filtering;
  data: Data;
  constructor(app, id, page, custo) {
    this._doc = app.openDocument(id, page, custo);
    this.marking = new Marking(this._doc.marking);
    this.filtering = new Filtering(this._doc.filtering);
    this.data = new Data(this._doc.data);
  }
  private do = <T>(m) => doCall<T>(this._doc, m);
  public getDocumentMetadata$ = (): Observable<DocMetadata> => this.do<DocMetadata>('getDocumentMetadata').pipe(
    map(g => new DocMetadata(g)))
  public getDocumentProperties$ = () => this.do('getDocumentProperties');
  public getPages$ = () => this.do('getPages');
  public getBookmarks$ = () => this.do('getBookmarks');
  public getBookmarkNames$ = () => this.do('getBookmarkNames');
  public getReports$ = () => this.do('getReports');
  public getActivePage$ = () => this.do<PageState>('getActivePage');

  public getMarking = () => this.marking._marking;
  public getFiltering = () => this.filtering._filtering;
  public getData = () => this.data._data;
}

class Marking {
  constructor(public _marking) { }
  public getMarkingNames$ = () => doCall(this._marking, 'getMarkingNames');
  public onChanged$ = (m, t, c, n) => doCall(this._marking, 'onChanged', m, t, c, n);
}

class Filtering {
  constructor(public _filtering) { }
  public setFilters = (flts) => {
    console.log(' ----> FILTER:', flts, spotfire.webPlayer.filteringOperation.REPLACE);
    this._filtering.setFilters(flts, spotfire.webPlayer.filteringOperation.REPLACE);
  }
}

export class Data {
  allTables = {};
  constructor(public _data) { }

  private getDataTables$ = () => doCall<DataTable[]>(this._data, 'getDataTables');

  private getDataTable$ = (t) => doCall<DataTable>(this._data, 'getDataTable', t).pipe(mergeMap(f => this.getDataColumns$(f)));

  private getDataColumns$ = (t) => doCall<DataColumn[]>(t, 'getDataColumns').pipe(
    mergeMap(columns => {
      console.log('[OBS]', 'getDataColumns', columns, _.where(columns, { dataType: 'String' }));
      const obs = [];
      _.each(_.where(columns, { dataType: 'String' }), col => {
        // _.each(columns, col => {
        obs.push(observableOf(col));
        obs.push(this.getDistinctValues$(col).pipe(tap(g => col.values = g)));
      });
      return forkJoin(obs);
    }))

  private getDistinctValues$ = (t: DataColumn, s = 0, n = 20) => doCall<DistinctValues>(t, 'getDistinctValues', s, n).pipe(
    tap(g => console.log('[OBS]', 'DistinctValues', g, g.count > 0 && g.count < 25)),
    // filter(g => g.count > 0 && g.count < 25),
    //  tap(g => console.log('[OBS]', 'DistinctValues filtres', g)),
    pluck('values'))

  public getAllTables$ = () => this.getDataTables$().pipe(
    mergeMap(tables => {
      const obs = [];
      _.each(tables, table => obs.push(this.getDataTable$(table.dataTableName)));
      return forkJoin(obs);
    }), map(tables => {
      const dataTables = {};
      _.each(tables, columns => {
        // chunk columns, as columns is [ DataColumn, values, DataColumn, values, ...]
        // whunk will do : [ [ DataColumn, values ], [ DataColumn, values ], ...]
        _.each(_.chunk(columns, 2), ([datacol, values]) => {
          const tname = datacol['dataTableName'];
          const cname = datacol['dataColumnName'];
          if (!dataTables[tname]) { dataTables[tname] = {}; }
          dataTables[tname][cname] = values;
        });
      });
      return dataTables;
    }))
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
