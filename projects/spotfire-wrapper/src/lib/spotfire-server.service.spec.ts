import { TestBed } from '@angular/core/testing';

import { SpotfireServerService } from './spotfire-server.service';

describe('SpotfireServerService', () => {
  let service: SpotfireServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotfireServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
