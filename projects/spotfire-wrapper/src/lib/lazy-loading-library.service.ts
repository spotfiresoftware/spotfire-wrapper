/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingLibraryService {
  private loadedLibraries: { [url: string]: ReplaySubject<any> } = {};

  constructor(@Inject(DOCUMENT) private readonly document: any) { }

  public loadJs(url: string): Observable<any> {
    if (this.loadedLibraries[url]) {
      return this.loadedLibraries[url].asObservable();
    }

    this.loadedLibraries[url] = new ReplaySubject();

    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = () => {
      this.loadedLibraries[url].next('');
      this.loadedLibraries[url].complete();
    };
    script.onerror = () => {
      console.error(`Library ${url} is not loaded !`);
      this.loadedLibraries[url].error(`Cannot load Spotfire JS library from ${url}. Check the URL !`);
    };

    this.document.body.appendChild(script);
    return this.loadedLibraries[url].asObservable();
  }
}
