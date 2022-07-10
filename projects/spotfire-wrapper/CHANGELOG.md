# Wrapper for TIBCO Spotfire(R) Changelog

(all changes without author notice are by [@nicolasderoche](https://github.com/nicolasderoche))

<a name="0.18.0"></a>

## [0.18.0](2022-07-10)

### Improvements

- Upgrade to Angular 14.0.5 ([#157](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/157) by [@Gerromie](https://github.com/Gerromie))

<a name="0.16.0"></a>

## [0.16.0](2021-10-26)

### Improvements

- Upgrade to Angular 12.2.11

<a name="0.15.1"></a>

## [0.15.1](2021-10-16)

### Bug Fixes

- Marked rows were sometimes not emited after marking changes.

<a name="0.15.0"></a>

## [0.15.0](2021-07-15)

### Improvements

- Upgrade to Angular 11.2.14
- Open multiple reports of the same Spotfire dashboard on one webpage, All are linked together. The marking and filtering performed on one report is reflected to the others - ([#108](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/108) by [@hpeters83](https://github.com/hpeters83))

<a name="0.14.3"></a>

## [0.14.3](2021-04-14)

### Improvements

- export SpotfireFilterSetting
- when `parameters` is modified, the dashboard is reloaded

<a name="0.14.2"></a>

## [0.14.2](2021-03-21)

### Improvements

- Upgrade to Angular 11.2.6
- When debug mode is set to false (its default value) the spotfire-wrapper now displays no debug messages.
- When `path` is modified, the dashboard is updated accordingly
- Monitoring of Spotfire Server status is only activated when `serverStatusEvent` is used

### Bug Fixes

- ngOnChanges not triggered for Input parameters ([#87](https://github.com/TIBCOSoftware/spotfire-wrapper/issues/87))

<a name="0.14.1"></a>

## [0.14.1](2021-02-01)

### Improvements

- Publish as public package to GitHub Packages

<a name="0.14.0"></a>

## [0.14.0](2021-01-30)

### Improvements

- Upgrade to Angular 11.1.1

<a name="0.13.0"></a>

## [0.13.0](2020-10-16)

### Improvements

- `displayInfoMessage` and `displayErrorMessage` can be overriden by child class ([#81](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/82) by [@mcrodrig](https://github.com/mcrodrig))
- Upgrade to Angular 10.1.6

<a name="0.12.2"></a>

## [0.12.2](2020-09-18)

### Bug Fixes

- Fixed timer issue on Server monitoring

<a name="0.12.1"></a>

## [0.12.1](2020-09-17)

### Bug Fixes

- Removed a problematic HTTP interceptor ([#79](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/79) by [@Gerromie](https://github.com/Gerromie))

<a name="0.12.0"></a>

## [0.12.0](2020-08-16)

### Features

- Upgrade to Angular 10.1.1
- Added a new service that monitors the status of the TIBCO Spotfire Server. ([#79](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/79) by [@Gerromie](https://github.com/Gerromie))
- Add a new output parameter `serverStatusEvent` that emits a `SpotfireServer` class after the TIBCO Spotfire Server has been monitored. ([#79](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/79) by [@Gerromie](https://github.com/Gerromie))
- Demo1 can demonstrate the code. ([#79](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/79) by [@Gerromie](https://github.com/Gerromie))
- expose SpotfireApplication and SpotfireDocument to have access to their properties and methods
  ex: access to Spotfire document properties, as demonstrated in demo3

### Breaking Changes

- All expoed classes have now 'Spotfire' as prefix (`SpotfireApplication`, `SpotfireDocument`, `SpotfireReporting`, ...).

<a name="0.11.6"></a>

## [0.11.6](2020-08-15)

### Bug Fixes

- Restores the ability to install the NPM package. Reopened Issue #75.

<a name="0.11.1"></a>

## [0.11.1](2020-08-14)

### Features

- Allow the spotfire-wrapper component to specify a version of the JavaScript API or to default to a reasonable server version. ([#73](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/73) by [@Gerromie](https://github.com/Gerromie))

### Bug Fixes

- Restores the ability to install the NPM package. Issue #75.

<a name="0.11.0"></a>

## [0.11.0](2020-08-10)

### Features

- Migrate to Angular 10.0.8 ([#72](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/72) by [@Gerromie](https://github.com/Gerromie))

<a name="0.10.0"></a>

## [0.10.0](2020-08-08)

### Features

- Add a new output parameter `filtering` that emits a `SpotfireFiltering` class once document is ready.
  This `SpotfireFiltering`class provides the following functions: `getFilteringScheme(filteringSchemeName)`, `getFilteringSchemes()`, `getActiveFilteringScheme()`, `setFilters()`, `resetAllFilters()` and `getAllModifiedFilterColumns$()`

### Breaking Changes

- The output parameter `reportingEvent` as been renamed `reporting`.

<a name="0.9.0"></a>

## [0.9.0](2020-08-05)

### Features

- Migrate to Angular 9.1.2. ([#71](https://github.com/TIBCOSoftware/spotfire-wrapper/pull/71) by [@Gerromie](https://github.com/Gerromie))

<a name="0.8.0"></a>

## [0.8.0](2020-03-03)

### Features

- Migrate to Angular 8.2.14.
- Add a new output parameter `reportingEvent` that emits a `SpotfireExporting` class once document is ready.
  This `SpotfireExporting` class provides the following export functions: `print`, `exportToPowerPoint`, `exportToPdf`, `exportReport`, `exportActiveVisualAsImage` and `getReports`. Note: These export functions may require specific tooling inside Spotfire (check any javascript errors thrown in console if nothing appears).
- Updated `demo1` with: `filters` as an object, `filters` as a string, export buttons and a fullscreen button to enlarge Spotfire dashboard using CSS.

### Bug Fixes

- `filters` when send as a string were not properly parsed. This is fixed.

<a name="0.7.3"></a>

## [0.7.3](2020-02-07)

- Listen for change of `filters` parameters

<a name="0.2.1"></a>

## [0.2.1](2019-03-28)

### Features

- Publish on `artifacts.tibco.com`

<a name="0.1.0"></a>

## [0.2.1](2019-03-28)

### Performance Improvements

- Use `setActivePage` when document is already created. Quicker to move from one page to an other one.
