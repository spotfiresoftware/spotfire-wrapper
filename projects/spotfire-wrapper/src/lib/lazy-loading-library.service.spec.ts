/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { inject, TestBed } from '@angular/core/testing';

import { LazyLoadingLibraryService } from './lazy-loading-library.service';

describe('LazyLoadingLibraryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LazyLoadingLibraryService]
    });
  });

  it('should be created', inject([LazyLoadingLibraryService], (service: LazyLoadingLibraryService) => {
    expect(service).toBeTruthy();
  }));
});
