// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import { Injectable } from '@angular/core';

import { delay, map, mergeMap, tap } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import { SpotfireCustomization } from './spotfire-customization';
import { LazyLoadingLibraryService } from './lazy-loading-library.service';
import { Application, Document, SpotfireParameters } from './spotfire-webplayer';

declare let spotfire: any;

@Injectable({ providedIn: 'root' })
export class DocumentService {

  constructor(public lazySvc: LazyLoadingLibraryService) { }

  doConsole = (...args: any[]) => console.log('[DOCUMENT-SERVICE]', ...args);

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  //
  public getMetadata$ = (params: SpotfireParameters): Observable<{}> =>
    this.openWebPlayer$(params).pipe(
      mergeMap(doc => forkJoin([
        doc.getDocumentMetadata$(),
        doc.getData().getTables$(),
        doc.getMarking().getMarkingNames$()])),
      map(([metadata, tables, markings]) => ({ metadata, tables, markings })))

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  //
  public openWebPlayer$(params: SpotfireParameters): Observable<Document> {
    this.doConsole(`openWebPlayer(${params.domid}, ${params.url})`, params);

    // lazy load the spotfire js API
    //
    const sfLoaderUrl = `${params.url}/spotfire/js-api/loader.js`;
    return this.lazySvc.loadJs(sfLoaderUrl).pipe(
      delay(1000),
      tap(f => this.doConsole(`Spotfire ${sfLoaderUrl} is LOADED !!!`, params.domid, f, spotfire, params.page, params.customization)),
      mergeMap(_ => this.openPath$(params)));
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  //
  public openPath$(params: SpotfireParameters): Observable<Document> {
    this.doConsole(`openPath(${params.path})`, params);
    if (params.document) {
      params.document.close();
    }
    // FIXTHIS, we might need to wait for onClosed callback
    params.document = null;

    // Prepare Spotfire app with path/page/customization
    //
    params.app = new Application(
      params.url,
      params.customization,
      params.path,
      params._parameters,
      params.reloadAnalysisInstance,
      params.version,
      this.onCreateLoginElement);
    /**
     * Callback played once Spotfire API responds to Application creation
     *
     * Will open the target page
     */
    return params.app.onApplicationReady$.pipe(
      tap(f => this.doConsole('onApplicationReady$ is done')),
      mergeMap(_ => this.openPage$(params)));
  }
  /**
     * @description
     * Callback played if Spotfire requires some login
     *
     */

  private onCreateLoginElement = () => {
    this.doConsole('Creating the login element');
    // Optionally create and return a div to host the login button
    console.warn(`Cannot login`);
    return null;
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  //
  public openPage$(params: SpotfireParameters): Observable<Document> {

    this.doConsole(`openPage(${params.page})`, params);

    // Ask Spotfire library to display this path/page (with optional customization)
    //
    if (!params.app || !(params.app instanceof Application)) {
      throw new Error('Spotfire webapp is not created yet');
    }
    //    const idDom = `is${new Date().getTime()}`;


    this.doConsole('getDocument', params.domid, `cnf=${params.page}`, params.app, params.document, params.customization);
    // Here is the call to 'spotfire.webPlayer.createApplication'
    //
    if (params.document) {
      this.doConsole(`SpotfireViewerComponent setActivePage(${params.page})`);
      params.document.setActivePage(params.page);
      return new Observable<Document>(o => {
        o.next(params.document as Document);
        o.complete();
      });
    } else {
      params.document = params.app.getDocument(params.domid, params.page, params.customization as SpotfireCustomization);
      return params.document.onDocumentReady$().pipe(
        map(f => params.document as Document),
        tap(f => this.doConsole('onDocumentReady$ is done', f)));
    }
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
}
