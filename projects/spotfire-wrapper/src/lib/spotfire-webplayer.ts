/*
* Copyright (c) 2019-2021. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import {forkJoin, of as observableOf, throwError, zip, BehaviorSubject, Observable, TimeoutError} from 'rxjs';
import {catchError, filter, map, mergeMap, pluck, tap, timeout} from 'rxjs/operators';

import {SpotfireCustomization as Customization, SpotfireFilter} from './spotfire-customization';

declare let spotfire: any;

const doConsole = (...args: any[]) => {
    console.log('[SPOTFIRE-WEBPLAYER]', ...args);
};

class PageState {
    index: number;
    pageTitle: string;
}

class DataTable {
    dataTableName: string;
}

class DataColumn {
    dataColumnName: string;
    dataTableName: string;
    dataType: string;
    values: any;
}

class DistinctValues {
    count: number;
    values: string[];
}

export class SpotfireMarking {
    constructor(public _marking) {
    }

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
 *    import { SpotfireFiltering } from '@tibcosoftware/spotfire-wrapper';
 *    ...
 *    filtering: SpotfireFiltering = null;
 *    onFiltering = (e: SpotfireFiltering) => this.filtering = e;
 *    getSchemes = () => this.filtering.getFilteringSchemes$()
 *         .subscribe(schemes => console.log('My Schemes', schemes));
 */
export class SpotfireFiltering {
    constructor(private _filtering) {
    }

    setFilters = (flts) => this._filtering.setFilters(flts, spotfire.webPlayer.filteringOperation.REPLACE);
    resetAllFilters = () => this._filtering.resetAllFilters();
    getAllModifiedFilterColumns$ = () => doCall<SpotfireFilter[]>(
        this._filtering, 'getAllModifiedFilterColumns',
        spotfire.webPlayer.includedFilterSettings.ALL_WITH_CHECKED_HIERARCHY_NODES
    );
    getFilteringScheme$ = (filteringSchemeName: string) => doCall<FillteringScheme>(
        this._filtering, 'getFilteringScheme', filteringSchemeName);
    getFilteringSchemes$ = () => doCall<FillteringScheme>(
        this._filtering, 'getFilteringSchemes');
    getActiveFilteringScheme$ = () => doCall<FillteringScheme[]>(
        this._filtering, 'getActiveFilteringScheme');
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
    externalDomIds: string[];
    sid: string;
    customization: Customization;
    version = '7.14'; // Nominal fall back value
    debug = false;
    reloadAnalysisInstance = false;
    document: SpotfireDocument;
    app: any;
    _parameters: string;

    constructor(vars?: any) {
        if (vars) {
            Object.keys(vars).forEach(key => this[key] = vars[key]);
        }
        // Create a Unique ID for this Spotfire dashboard
        //
        this.domid = this.domid ? this.domid : this.sid ? `${this.sid}` : `${new Date().getTime()}`;
    }
}

export class SpotfireData {
    allTables = {};

    constructor(private _data) {
    }

    getTables$ = () => this.getDataTables$().pipe(
        mergeMap(tables => {
            const obs = [];
            tables.forEach(table => obs.push(this.getDataTableColNames$(table.dataTableName)));
            return forkJoin(obs);
        }),
        map(k => {
            let z = {};
            k.forEach((p: any) => z = {...z, ...p});
            return z;
        })
    );
    getAllTables$ = () => this.getDataTables$().pipe(
        mergeMap(tables => {
            const obs = [];
            tables.forEach(table => obs.push(this.getDataTable$(table.dataTableName)));
            return forkJoin(obs);
        }), map(tables => {
            const dataTables = [];
            (tables[0] as []).forEach(columns => {
                const tname = columns['tabName'];
                if (!dataTables[tname]) {
                    dataTables[tname] = {};
                }
                dataTables[tname][columns['colName']] = columns['vals'];
            });
            return dataTables;
        }));

    // A Spotfire analysis contains one or more data tables, retrieved by the getDataTable,
    // getActiveDataTable and getDataTables methods.
    private getDataTables$ = () => doCall<DataTable[]>(this._data, 'getDataTables');

    private getDataTableColNames$ = (t) => doCall<DataTable>(this._data, 'getDataTable', t)
        .pipe(mergeMap(f => this.getDataColumns$(f)), map(d => ({[t]: d})));

    private getDataTable$ = (t) => doCall<DataTable>(this._data, 'getDataTable', t)
        .pipe(mergeMap(f => this.getDataColumns$(f)));

    // Each data table contains one or more data columns, retrieved by the getDataColumn,
    // getDataColumns and searchDataColumns.
    private getDataColumns$ = (t) => doCall<DataColumn[]>(t, 'getDataColumns').pipe(
        mergeMap(columns => {
            const obs = [];
            columns.forEach((col: DataColumn) => obs.push(zip(...[observableOf(col)], (a: DataColumn, b) => a.dataColumnName)));
            return forkJoin(obs);
        })
    );

    // From the DataColumn class it is possible to retrieve metadata, such as column name and data type.
    // It is also possible to get a list of the unique values in the data column with the getDistinctValues method.
    private getDistinctValues$ = (t: DataColumn) => doCall<DistinctValues>(t, 'getDistinctValues', 0, 20).pipe(
        tap(g => doConsole('Data.DistinctValues$', t, g, g.count > 0 && g.count < 25)),
        // filter(g => g.count > 0 && g.count < 25),
        //  tap(g => doConsole('[OBS]', 'DistinctValues filtres', g)),
        pluck('values'));
}

export class SpotfireDocumentMetadata {
    size: number;
    sizeUnit = 'B';
    /** Gets the content size in bytes of this item. */
    contentSize: number;
    /** Gets a DateTime describing when this item was created in the library. */
    created: Date;
    /** Gets the description of this item. */
    description: string;
    /** Gets a DateTime describing when the last modification of this item was made in the library. */
    lastModified: Date;
    /** Gets the path of this item, or null if the path was not retrieved from the library when this item was created. */
    path: string;
    /** Gets the title of this item. */
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

export class SpotfireProperty {
    /** The name of the property. */
    name: string;
    /** The value of the property as a formatted string or an array of formatted strings, in the users locale. */
    value: string | string[];
}

export class SpotfireDocument {
    private _doc;
    private marking: SpotfireMarking;
    private filtering: SpotfireFiltering;
    private data: SpotfireData;
    private readonly mainId: string;
    // Used to store alternative spotfire view windows
    private alternativeViewWindows = {};
    constructor(app, ids, page, custo) {
        // this._doc = app.openDocument(id, page, custo);
        if (ids.length > 0) {
            this.mainId = ids[0];
            // Open the main ID
            this._doc = app.openDocument(this.mainId, page, custo);
        }
        // Keep i at 1 to skip the first element
        for (let i = 1; i < ids.length; i++) {
            this.alternativeViewWindows[ids[i]] = {};
            this.alternativeViewWindows[ids[i]] = app.openDocument(ids[i], page, custo);
        }
        app.onOpened$().subscribe(doc => {
            doConsole(`Document.onOpened$: page is now opened:`, doc);
            if(doc.elementId === this.mainId) {
                this._doc = doc;
            }
            // Register event handler for page change events.
            this.onActivePageChanged$().subscribe(this.onActivePageChangedCallback);
            this.marking = new SpotfireMarking(this._doc.marking);
            this.filtering = new SpotfireFiltering(this._doc.filtering);
            this.data = new SpotfireData(this._doc.data);
        });
    }
    init$(app): Observable<SpotfireDocument> {
        return app.onOpened$().pipe(map((doc: SpotfireDocument) => {
            this.alternativeViewWindows[doc['elementId']] = doc;
            if (doc['elementId'] === this.mainId) {
                this._doc = doc;
                // Register event handler for page change events.
                this.onActivePageChanged$().subscribe(this.onActivePageChangedCallback);
                this.marking = new SpotfireMarking(this._doc.marking);
                this.filtering = new SpotfireFiltering(this._doc.filtering);
                this.data = new SpotfireData(this._doc.data);
            }
            return this;
        }));
    }
    getData() {
        if (!this.data) {
            this.marking = new SpotfireMarking(this._doc.marking);
            this.filtering = new SpotfireFiltering(this._doc.filtering);
            this.data = new SpotfireData(this._doc.data);
        }
        doConsole(`Document.getData: b)`, JSON.stringify(this.data));
        return this.data;
    }
    getDocumentMetadata$ = (): Observable<SpotfireDocumentMetadata> =>
        this.do<SpotfireDocumentMetadata>('getDocumentMetadata').pipe(map(g => new SpotfireDocumentMetadata(g)));
    /** Get a list of the pages in the current document. */
    getPages$ = () => this.do('getPages').pipe(map(m => Object.keys(m).map(f => m[f].pageTitle)));
    /** Get a list of all the properties in the document. */
    getDocumentProperties$ = () => this.do<SpotfireProperty[]>('getDocumentProperties');
    /** Get the information about the property with given name. */
    getDocumentProperty$ = (propertyName: string) => doCall<SpotfireProperty>(this._doc, 'getDocumentProperty', propertyName);
    setDocumentProperty = (propertyName: string, value: string | string[]) => this._doc.setDocumentProperty(propertyName, value);
    // getBookmarks$ = () => this.do('getBookmarks');
    // getBookmarkNames$ = () => this.do('getBookmarkNames');
    // getReports$ = () => this.do('getReports');
    /** Get the information about the active page. */
    getActivePage$ = (id?: string) => {
        if (id) {
            return new Observable<PageState>(observer => {
                if (this.alternativeViewWindows[id]) {
                    this.alternativeViewWindows[id].getActivePage(page => {
                        observer.next(page);
                    });
                } else {
                    observer.complete();
                }
            });
        } else {
            return this.do<PageState>('getActivePage');
        }
    };
    /** Change the active page. */
    setActivePage = (p: string | number, id?: string) => {
        if (id) {
            // Setting active page on alternative id
            if (this.alternativeViewWindows[id]) {
                this.alternativeViewWindows[id].setActivePage(p);
            }
        } else {
            this._doc.setActivePage(p);
        }
    };
    // getData = () => this.data;
    getMarking = () => this.marking;
    getFiltering = () => this.filtering;
    _d = () => this._doc ? this._doc : null;
    /** Event raised, when the document switches to the ready state (the round icon in the status bar becomes green). */
    onDocumentReady$ = () => this.do('onDocumentReady');
    close = () => this._doc ? this._doc.close() : null;
    private onActivePageChangedCallback = (pageState) => doConsole('onActivePageChangedCallback', pageState);
    private do = <T>(m: string) => doCall<T>(this._doc, m);
    private onActivePageChanged$ = () => this.do('onActivePageChanged');
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
 *    import { SpotfireReporting } from '@tibcosoftware/spotfire-wrapper';
 *    ...
 *    reporting: SpotfireReporting = null;
 *    onReporting = (e: SpotfireReporting) => this.reporting = e;
 *    exportAsImage = () => this.reporting.exportActiveVisualAsImage();
 */
export class SpotfireReporting {
    private exp;

    constructor(doc: SpotfireDocument) {
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
    statusMessage: string;

    constructor(public serverUrl: string, public isOnline: boolean) {
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
const doCall = <T>(obj, m: string, ...a: any[]): Observable<T> => {
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
            const p = (g: T) => {
                observer.next(g);
                observer.complete();
            };
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
};

export class SpotfireApplication {
    readonly onApplicationReady$: Observable<boolean>;
    private readySubject = new BehaviorSubject<boolean>(false);
    private _app: any;

    constructor(
        public url: string,
        public customization: Customization,
        public path: string,
        public parameters: string,
        public reloadAnalysisInstance: boolean,
        public version: string,
        public onCreateLoginElement) {
        this.onApplicationReady$ = this.readySubject.asObservable().pipe(filter(d => d));
        this._app = new spotfire.webPlayer.createApplication(this.url,
            this.customization, this.path, this.parameters, this.reloadAnalysisInstance,
            this.version, this.onReadyCallback, this.onCreateLoginElement);
    }

    onOpened$ = () => doCall(this._app, 'onOpened');
    getDocument$ = (id: string[], page: string | number, custo?: Customization): Observable<SpotfireDocument> => {
        const doc = new SpotfireDocument(this, id, page, custo ? custo : this.customization);
        return doc.init$(this);
    };
    openDocument = (id: string, page: string | number, custo: Customization) => this._app.openDocument(id, page, custo);

    private onReadyCallback = (response, newApp: SpotfireApplication) => {
        if (!!response && !!newApp) { // ignore undefined response
            doConsole('Application.onReadyCallback', response, newApp);
            this._app = newApp;
            // Register an error handler to catch errors.
            this._app?.onError(this.onErrorCallback);
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
    };
    // Displays an error message if something goes wrong in the Web Player.
    private onErrorCallback = (errCode: string, desc: string) => console.error(`[SPOTFIRE-WEBPLAYER] ${errCode}: ${desc}`);
}
