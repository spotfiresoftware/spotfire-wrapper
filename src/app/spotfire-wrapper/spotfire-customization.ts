// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.

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
    if (vars) {
      Object.keys(vars).forEach(key => this[key] = vars[key]);
    }
  }
}

export class SpotfireFilterSetting {
  values: Array<string> = [];
  lowValue = null;
  highValue = null;
  includeEmpty = true;
  searchPattern = null;
  hierarchyPaths = [];
  constructor(vars?: {}) {
    console.log('New SpotfireFilterSetting', vars);
    if (vars) {
      Object.keys(vars).forEach(key => this[key] = vars[key]);
    }
  }
}

export class SpotfireFilter {
  filteringSchemeName = 'Filtering scheme';
  dataTableName: string;
  dataColumnName: string;
  filterType: string;
  filterSettings: Array<SpotfireFilterSetting>;
  constructor(vars?: {}) {
    console.log('New SpotfireFilter', vars);
    if (vars) {
      Object.keys(vars).forEach(key => this[key] = vars[key]);
    }
  }
}
