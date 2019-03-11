import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotfireWebplayerComponent } from './spotfire-webplayer.component';

describe('SpotfireWrapperComponent', () => {
  let component: SpotfireWebplayerComponent;
  let fixture: ComponentFixture<SpotfireWebplayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpotfireWebplayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotfireWebplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
