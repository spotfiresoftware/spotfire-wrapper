/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotfireEditorComponent } from './spotfire-editor.component';

describe('SpotfireWrapperComponent', () => {
  let component: SpotfireEditorComponent;
  let fixture: ComponentFixture<SpotfireEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpotfireEditorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotfireEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
