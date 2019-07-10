// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.

// https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SpotfireViewerModule } from '../viewer/spotfire-viewer.module';
import { SpotfireEditorComponent } from './spotfire-editor.component';

@NgModule({
  imports: [SpotfireViewerModule, ReactiveFormsModule, FlexLayoutModule,
    MatSelectModule, MatToolbarModule, MatCheckboxModule,
    MatButtonModule, MatFormFieldModule, MatInputModule],
  declarations: [SpotfireEditorComponent],
  entryComponents: [SpotfireEditorComponent],
  exports: [SpotfireEditorComponent]
})
export class SpotfireEditorModule { }
