/*
* Copyright (c) 2019-2021. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

export class SpotfireCustomization {
  showAbout = false;
  showAnalysisInformationTool = false;
  showAuthor = false; // this enable 'edit' button.
  showClose = false;
  showCustomizableHeader = false;
  showDodPanel = false; // Details-on-Demand panel
  showExportFile = false;
  // showExportVisualization = false; marked as obsolete since Spotfire X
  showFilterPanel = false;
  showHelp = false;
  showLogout = false;
  showPageNavigation = false;
  // showAnalysisInfo = false;  marked as obsolete since Spotfire X
  /* showReloadAnalysis = false; marked as obsolete */
  showStatusBar = false;
  showToolBar = false;
  showUndoRedo = false;
  constructor(vars?: any) {
    if (vars) {
      Object.keys(vars).forEach(key => this[key] = vars[key]);
    }
  }
}

export class SpotfireFilterSetting {
  values: string[] = [];
  lowValue = null;
  highValue = null;
  includeEmpty = true;
  searchPattern = null;
  hierarchyPaths = [];
  constructor(vars?: any) {
    if (vars) {
      Object.keys(vars).forEach(key => this[key] = vars[key]);
    }
  }
}

export class SpotfireFilter {
  filteringSchemeName: string;
  dataTableName: string;
  dataColumnName: string;
  filterType: string | any;
  filterSettings: SpotfireFilterSetting[];
  constructor(vars?: any) {
    if (vars) {
      Object.keys(vars).forEach(key => this[key] = vars[key]);
    }
  }
  /*
  setFilterType(s) {
    console.log('ON SET LE TYPER', this.filterType);
    if (this.filterType === 'ListBoxFilter') {
      this.filterType = s.webPlayer.filterType.LIST_BOX_FILTER;
      console.log('ON SET LE TYPE a ', s.webPlayer.filterType.LIST_BOX_FILTER);
    }
  }
  */
}
