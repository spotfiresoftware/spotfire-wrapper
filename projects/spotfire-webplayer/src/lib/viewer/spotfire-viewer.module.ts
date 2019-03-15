// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.

// https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotfireViewerComponent } from './spotfire-viewer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SpotfireViewerComponent],
  entryComponents: [SpotfireViewerComponent],
  exports: [SpotfireViewerComponent, CommonModule]
})
export class SpotfireViewerModule { }
