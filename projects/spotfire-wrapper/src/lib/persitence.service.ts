/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PersistanceService {
  pfx = '';
  set = (key: string, data: any) => {
    try {
      localStorage.setItem(`${this.pfx}.sw.${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
  get = (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(`${this.pfx}.sw.${key}`));
    } catch (e) {
      console.error('Error getting data from localStorage', e);
      return null;
    }
  }
}
