// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.

// https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  MatFormFieldModule, MatInputModule, MatButtonModule,
  MatSelectModule, MatToolbarModule, MatCheckboxModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SpotfireWebplayerModule } from '../viewer/spotfire-viewer.module';
import { SpotfireEditorComponent } from './spotfire-editor.component';

@NgModule({
  imports: [SpotfireWebplayerModule, ReactiveFormsModule, FlexLayoutModule,
    MatSelectModule, MatToolbarModule, MatCheckboxModule,
    MatButtonModule, MatFormFieldModule, MatInputModule],
  declarations: [SpotfireEditorComponent],
  entryComponents: [SpotfireEditorComponent],
  exports: [SpotfireEditorComponent]
})
export class SpotfireEditorModule { }
