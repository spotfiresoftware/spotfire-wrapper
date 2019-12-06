/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

import { SpotfireEditorComponent } from './spotfire-editor.component';

import { SpotfireViewerModule } from '../viewer/spotfire-viewer.module';

@NgModule({
  imports: [SpotfireViewerModule, ReactiveFormsModule, FlexLayoutModule,
    MatSelectModule, MatToolbarModule, MatCheckboxModule,
    MatButtonModule, MatFormFieldModule, MatInputModule],
  declarations: [SpotfireEditorComponent],
  entryComponents: [SpotfireEditorComponent],
  exports: [SpotfireEditorComponent]
})
export class SpotfireEditorModule { }
