import { TestBed } from '@angular/core/testing';

import { SpotfireWebplayerService } from './spotfire-webplayer.service';

describe('SpotfireWebplayerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpotfireWebplayerService = TestBed.get(SpotfireWebplayerService);
    expect(service).toBeTruthy();
  });
});
