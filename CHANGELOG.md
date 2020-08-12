<a name="0.11.0"></a>
## [0.11.0] (2020-08-10)

### Features
 * Migrate to Angular 10.0.8  

<a name="0.10.0"></a>
## [0.10.0] (2020-08-08)

### Features
 * Add a new output parameter `filtering` that emits a `SpotfireFiltering` class  once document is ready.
   This `SpotfireFiltering`class provides the following functions: `getFilteringScheme(filteringSchemeName)`, `getFilteringSchemes()`, `getActiveFilteringScheme()`, `setFilters()`, `resetAllFilters()` and `getAllModifiedFilterColumns$()`

### Breaking Changes
 * The output parameter `reportingEvent` as been renamed `reporting`.

<a name="0.9.0"></a>
## [0.9.0] (2020-08-05)

### Features
 * Migrate to Angular 9.1.2.

<a name="0.8.0"></a>
## [0.8.0] (2020-03-03)

### Features
 * Migrate to Angular 8.2.14.
 * Add a new output parameter `reportingEvent` that emits a `SpotfireExporting` class once document is ready.
   This `SpotfireExporting` class provides the following export functions: `print`, `exportToPowerPoint`, `exportToPdf`, `exportReport`, `exportActiveVisualAsImage` and `getReports`. Note: These export functions may require specific tooling inside Spotfire (check any javascript errors thrown in console if nothing appears).
 * Updated `demo1` with: `filters` as an object, `filters` as a string, export buttons and a fullscreen button to enlarge Spotfire dashboard using CSS.
### Bug Fixes
 * `filters` when send as a string were not properly parsed. This is fixed.

<a name="0.7.3"></a>
## [0.7.3] (2020-02-07)
 * Listen for change of `filters` parameters

<a name="0.2.1"></a>
## [0.2.1] (2019-03-28)

### Features
 * Publish on `artifacts.tibco.com`

<a name="0.1.0"></a>
## [0.2.1] (2019-03-28)

### Performance Improvements
 * Use `setActivePage` when document is already created. Quicker to move from one page to an other one.
