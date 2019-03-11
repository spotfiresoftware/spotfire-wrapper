// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.

// https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SpotfireWebplayerComponent } from './spotfire-webplayer.component';
import { SpotfireWrapperComponent } from './spotfire-wrapper.component';

import {
  MatFormFieldModule, MatInputModule, MatButtonModule,
  MatSelectModule, MatToolbarModule, MatCheckboxModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FlexLayoutModule,
    MatSelectModule, MatToolbarModule, MatCheckboxModule,
    MatButtonModule, MatFormFieldModule, MatInputModule],
  declarations: [SpotfireWebplayerComponent, SpotfireWrapperComponent],
  entryComponents: [SpotfireWebplayerComponent, SpotfireWrapperComponent],
  exports: [SpotfireWebplayerComponent, SpotfireWrapperComponent]
})
export class SpotfireWebplayerModule { }
