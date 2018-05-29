// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import * as _ from 'underscore';

export class SpotfireCustomization {
  showAbout = false;
  showAnalysisInformationTool = false;
  showAuthor = false; // this enable 'edit' button.
  showClose = false;
  showCustomizableHeader = false;
  showDodPanel = false; // Details-on-Demand panel
  showExportFile = false;
  showExportVisualization = false;
  showFilterPanel = false;
  showHelp = false;
  showLogout = false;
  showPageNavigation = false;
  showAnalysisInfo = false;
  showReloadAnalysis = false;
  showStatusBar = false;
  showToolBar = false;
  showUndoRedo = false;
  constructor(vars?: {}) {
    console.log('New SpotfireCustomization', vars);
    _.each(vars, (v: boolean, key: string) => this[key] = v);
  }
}
