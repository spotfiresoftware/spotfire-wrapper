/*
* Copyright (c) 2019-2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Injectable } from '@angular/core';

import { forkJoin, Observable } from 'rxjs';
import { delay, map, mergeMap, tap } from 'rxjs/operators';

import { LazyLoadingLibraryService } from './lazy-loading-library.service';
import { SpotfireServerService } from './spotfire-server.service';
import { SpotfireCustomization } from './spotfire-customization';
import { Application, Document, SpotfireParameters } from './spotfire-webplayer';
import { EmitterVisitorContext } from '@angular/compiler';

declare let spotfire: any;

@Injectable({ providedIn: 'root' })
export class DocumentService {

  constructor(public lazySvc: LazyLoadingLibraryService) { }

  // tslint:disable-next-line:no-console
  doConsole = (...args: any[]) => console.log('[DOCUMENT-SERVICE]', ...args);

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  //
  getMetadata$ = (params: SpotfireParameters): Observable<{}> =>
    this.openWebPlayer$(params).pipe(
      mergeMap(doc => forkJoin([
        doc.getDocumentMetadata$(),
        doc.getData().getTables$(),
        doc.getMarking().getMarkingNames$()])),
      map(([metadata, tables, markings]) => ({ metadata, tables, markings })))

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  //
  openWebPlayer$(params: SpotfireParameters): Observable<Document> {
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
  openPath$(params: SpotfireParameters): Observable<Document> {
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

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  //
  openPage$(params: SpotfireParameters): Observable<Document> {

    this.doConsole(`openPage(${params.page})`, params);

    // Ask Spotfire library to display this path/page (with optional customization)
    //
    if (!params.app || !(params.app instanceof Application)) {
      throw new Error('Spotfire webapp is not created yet');
    }
    //    const idDom = `is${new Date().getTime()}`;

    this.doConsole('getDocument$', params.domid, `cnf=${params.page}`, params.app, params.document, params.customization);
    // Here is the call to 'spotfire.webPlayer.createApplication'
    //
    if (params.document) {
      this.doConsole(`SpotfireViewerComponent setActivePage(${params.page})`);
      params.document.setActivePage(params.page);
      return new Observable<Document>(o => {
        o.next(params.document as Document);
        o.complete();
      });
    }
    return params.app.getDocument$(params.domid, params.page, params.customization as SpotfireCustomization)
      .pipe(
        tap(doc => params.document = doc),
        mergeMap(doc => doc.onDocumentReady$().pipe(
          map(() => params.document as Document),
          tap(f => this.doConsole('onDocumentReady$ is done', f)))
        ));
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
}
