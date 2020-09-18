/*
* Copyright (c) 2020-2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { throwError, timer, Observable, Subject } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import { SpotfireServer } from './spotfire-webplayer';

@Injectable({
  providedIn: 'root'
})
/**
 * @description
 * Provide a means to monitor the TIBCO Spotfire Server. This checks the server's status API to ensure the server is running.
 * An informative message may be presented using the results.
 */
export class SpotfireServerService {
  spotfireServer: SpotfireServer = new SpotfireServer('', false);
  monitoring = false;

  /**
   * @description
   * An event emitted for subscribers to receive.
   */
  serverStatusEvent = new Subject<SpotfireServer>();

  constructor(private http: HttpClient) { }

  // tslint:disable-next-line:no-console
  doConsole = (...args: any[]) => console.log('[SPOTFIRE-SERVER-SERVICE]', ...args);

  isSpotfireServerOnline = () => this.spotfireServer.isOnline;

  monitorSpotfireServerStatus(url: string) {
    if (!this.monitoring) {
      this.monitoring = true;
      // timer(0, 60000), will emit values immediatly (0) and every minute (60000)
      timer(0, 10000).pipe(mergeMap(() => this.getSpotfireServerStatus(url))).subscribe();
    }
  }

  getSpotfireServerStatus(url: string): Observable<SpotfireServer> {
    this.spotfireServer.statusMessage = 'Attempting to determine server status.';
    this.spotfireServer.serverUrl = url;
    const statusUrl = this.getStatusUrl(url);
    this.doConsole('getting spotfire server status from ' + statusUrl);
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      })
    };
    return this.http.get<any>(statusUrl, options).pipe(
      catchError(err => this.handleError(err)),
      tap(resp => {
        this.doConsole('received response', resp, JSON.stringify(resp));
        this.spotfireServer.isOnline = true;
        this.getStatus(resp);
        this.doConsole('emit success', JSON.stringify(this.spotfireServer));
        this.serverStatusEvent.next(this.spotfireServer);
      }),
      map(r => {
        this.doConsole('returning the object', this.spotfireServer);
        return this.spotfireServer;
      })
    );
  }

  private getStatus(resp: any) {
    this.doConsole('Trying to get the status from ', resp);
    this.spotfireServer.statusMessage = `Server status received ${resp}`;
    this.doConsole('spotfire server status ', resp.status, resp.status === 200, JSON.stringify(this.spotfireServer));
  }

  private handleError(err: any): Observable<any> {
    this.doConsole('caught an error' + JSON.stringify(err));
    this.spotfireServer.isOnline = false;
    if (err.status === 0) {
      this.spotfireServer.statusMessage = 'Status code zero returned. Possible untrusted access.';
    } else {
      this.spotfireServer.statusMessage = 'An error occurred checking TIBCO Spotfire Server status';
    }
    this.serverStatusEvent.next(this.spotfireServer);
    return throwError('an error');
  }

  private getStatusUrl = (url: string) => `${url}/spotfire/rest/status/getStatus`;
}
