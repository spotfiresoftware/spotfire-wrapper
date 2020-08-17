/*
* Copyright (c) 2020-2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { SpotfireServerService } from './spotfire-server.service';

@Injectable({
  providedIn: 'root'
})
/**
 * @description
 * Intercept HTTP Request, force some header properties
 */
export class SpotfireServerInterceptor implements HttpInterceptor {

  constructor(private spotfireServerService: SpotfireServerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spotfireServerService.spotfireServer.statusMessage = 'Attempting to determine server status.';

    const request = req.clone({
      setHeaders: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    });
    return next.handle(request);
  }
}
