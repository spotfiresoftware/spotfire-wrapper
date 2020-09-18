<a name="0.12.1"></a>
## [0.12.1] (2020-09-17)

### Bug Fixes
 * Removed a problematic HTTP interceptor

<a name="0.12.0"></a>
## [0.12.0] (2020-09-11)

### Features
 * Upgrade to Angular 10.1.1
 * Added a new service that monitors the status of the TIBCO Spotfire Server.
 * Add a new output parameter `serverStatusEvent` that emits a `SpotfireServer` class after the TIBCO Spotfire Server has been monitored.
 * Demo1 can demonstrate the code.
 * expose SpotfireApplication and SpotfireDocument to have access to their properties and methods 
   ex: access to Spotfire document properties, as demonstrated in demo3 

### Breaking Changes
 * All expoed classes have now 'Spotfire' as prefix (`SpotfireApplication`, `SpotfireDocument`, `SpotfireReporting`, ...).


<a name="0.11.6"></a>
## [0.11.6] (2020-08-15)

### Bug Fixes
 * Restores the ability to install the NPM package. Reopened Issue #75.

<a name="0.11.1"></a>
## [0.11.1] (2020-08-14)

### Features
* Allow the spotfire-wrapper component to specify a version of the JavaScript API or to default to a reasonable server version.

### Bug Fixes
 * Restores the ability to install the NPM package. Issue #75.

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
