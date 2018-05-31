// Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
import {
  Component, Input, AfterViewInit, EventEmitter, ViewChild,
  ElementRef, Output, OnChanges, SimpleChanges, ViewEncapsulation, Renderer2
} from '@angular/core';
import { trigger, style, state, animate, transition } from '@angular/animations';

import * as _ from 'underscore';
import { LazyLoadingLibraryService } from './lazy-loading-library.service';
import { SpotfireCustomization } from './spotfire-customization';
import { Observable, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

// https://community.tibco.com/wiki/tibco-spotfire-javascript-api-overview
// https://community.tibco.com/wiki/mashup-example-multiple-views-using-tibco-spotfire-javascript-api

declare let spotfire: any;
const _SPOTFIRE = typeof spotfire === 'undefined' ? false : spotfire;
const s1 = style({ opacity: 1 }), s0 = style({ opacity: 1 });
@Component({
  template: `
<div #spot></div>
<code style='font-size:9px; color:#666; float:right'>{{url}}/{{path}}/{{page}}</code>`,
  animations: [
    trigger('apparait', [
      state('true', s1), state('false', s0),
      transition('* => true', [s0, animate(1000, s0), animate(8000, s1)])])],
  encapsulation: ViewEncapsulation.Emulated

  //  encapsulation: ViewEncapsulation.Native   <-- Don't use encapsulation. with this spotfire dashboard is not shown !!
})

export class SpotfireWrapperComponent implements AfterViewInit, OnChanges {
  // private _page: string;
  @Input() url: string;
  @Input() page: string;
  @Input() path = 'Homepage';
  @Input() cust: SpotfireCustomization = new SpotfireCustomization();
  @Input() version = '7.12';
  @ViewChild('spot', { read: ElementRef }) spot: ElementRef;

  // Optional configuration block
  private parameters = '';
  private reloadAnalysisInstance = false;

  // Optional configuration settings;
  private customization: any;
  // private filteringSchemeName = '';
  private app: any;

  private filtering: any;
  private filterSubject = new BehaviorSubject<Array<{}>>([]);
  public filter$: Observable<Array<{}>> = this.filterSubject.asObservable();
  @Output() filteringEvent: EventEmitter<any> = new EventEmitter(false);

  private marking: any;
  private markerSubject = new BehaviorSubject<{}>({});
  public marker$: Observable<{}> = this.markerSubject.asObservable();
  @Output() markingEvent: EventEmitter<any> = new EventEmitter(false);

  private markedRows = {};
  private data: any;
  public SPOTFIRE = _SPOTFIRE;

  view: any;
  longTime = false;

  constructor(private renderer: Renderer2, private service: LazyLoadingLibraryService) {
    _.delay(() => this.longTime = true, 3000);
    console.log('SPOT URL', this.url);
  }

  displayErrorMessage = (message: string) => {
    console.error('ERROR:', message);
    setTimeout(() => {
      const div = this.renderer.createElement('div');
      const text = this.renderer.createText(message);
      const span = this.renderer.createElement('span');
      const clear = this.renderer.createElement('span');
      const br = this.renderer.createElement('br');
      const link = this.renderer.createElement('a');
      const lien = this.renderer.createText(`Open Spotfire`);
      this.renderer.appendChild(link, lien);
      this.renderer.setAttribute(link, 'target', 'other_frame');
      this.renderer.setAttribute(link, 'title', `Visit ${this.url} in an other tab`);
      this.renderer.setAttribute(link, 'href', this.url);
      this.renderer.appendChild(span, text);


      this.renderer.appendChild(div, span);
      this.renderer.appendChild(div, link);
      this.renderer.appendChild(div, clear);

      this.renderer.setStyle(span, 'line-height', '2');

      this.renderer.setStyle(link, 'border', '1px solid #062e79');
      this.renderer.setStyle(link, 'border-radius', '8px');
      this.renderer.setStyle(link, 'background', '#0081cb');
      this.renderer.setStyle(link, 'color', 'white');
      this.renderer.setStyle(link, 'padding', '5px 10px');
      this.renderer.setStyle(link, 'text-decoration', 'none');

      this.renderer.setStyle(clear, 'clear', 'both');

      this.renderer.setStyle(div, 'border', '2px dashed salmon');
      this.renderer.setStyle(div, 'padding', '20px');
      this.renderer.setStyle(div, 'margin', '20px');
      this.renderer.setStyle(div, 'font-family', 'monospace');
      this.renderer.setStyle(div, 'display', 'flex');
      this.renderer.setStyle(div, 'justify-content', 'space-between');
      this.renderer.appendChild(this.spot.nativeElement, div);
    }, 0);
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('CHANGE', changes);
    if (changes.page) {
      //    this.openPage(changes.page.currentValue);
    }
  }
  ngAfterViewInit() {
    if (!this.url || this.url.length === 0) {
      this.displayErrorMessage('URL is missing');
      console.error(`Url attribute must be provided!`);
      return;
    }

    console.log('le SpotfireWrapper', this.url, this.path, this.page, this.markingEvent);
    // lazy load the spotfire js API
    //
    setTimeout(() => {
      this.service.loadJs(`${this.url}/GetJavaScriptApi.ashx?Version=${this.version}`)
        .subscribe(() => {
          console.log(`goPage, Spotfire ${this.version} is LOADED !!!`, spotfire, this.spot);
          this.SPOTFIRE = spotfire;
          console.log('SpotfireComponent', this.page, this.spot.nativeElement, this.cust);

          if (this.SPOTFIRE) {
            try {
              // Create a Unique ID for this Spotfire dashboard
              //
              this.spot.nativeElement.id = _.uniqueId('spot');
              // Prepare Spotfire app with path/page/customization
              //
              this.customization = new this.SPOTFIRE.webPlayer.Customization();
              this.customization = this.cust;
              this.app = new this.SPOTFIRE.webPlayer.Application(
                this.url, this.customization, this.path,
                this.parameters, this.reloadAnalysisInstance);

              // Customize based on user role
              //
              console.log('SpotfireService openDocument', this.cust);

              this.openPage(this.page);

            } catch (err) {
              this.displayErrorMessage(err);
            }
          } else {
            this.displayErrorMessage('Spotfire is not loaded');
          }
        }, err => this.displayErrorMessage(err));
    }, 1000);
  }
  private get isMarkingWiredUp() { return this.markingEvent.observers.length > 0; }
  private get isFilteringWiredUp() { return this.filteringEvent.observers.length > 0; }

  private openPage(page: string) {
    console.log('OpenPage', page, this.app);
    // Ask Spotfire library to display this path/page (with optional customization)
    //
    if (!this.app) {
      throw new Error('Spotfire webapp is not created yet');
    }

    console.log('SpotfireService openDocument', this.spot.nativeElement.id, page, this.app, this.customization);
    const doc = this.app.openDocument(this.spot.nativeElement.id, page, this.customization);

    if (this.isFilteringWiredUp) {
      this.filtering = doc.filtering;
      this.filtering.resetAllFilters();
      setInterval(() => this.loadFilters(), 3000);
      console.log('[SPOTFIRE] FILTER', this.filtering, this.filtering.getFilterColumn());

      // Subscribe to filteringEvent and emit the result to the Output if filter panel is displayed
      //
      this.filter$.pipe(distinctUntilChanged()).subscribe(f => this.filteringEvent.emit(f));
    }

    if (this.isMarkingWiredUp) {
      this.marking = doc.marking;
      this.data = doc.data;
      //      const datatable = doc.dataTable;
      //      data.datatable.getDataTableProperties(d => console.log('datatable.getDataTableProperties', d));
      //        datatable.getDataColumns(d => console.log('datatable.getDataColumns', d));
      this.data.getActiveDataTable(d => console.log('openPage.getActiveDataTable', d));

      // for each table
      //
      this.data.getDataTables(tables => {
        console.log('openPage.getDataTables', tables);
        _.each(tables, table => {
          table['getDataColumns'](cols => console.log(` - openPage.getDataTable(${table['dataTableName']}).getDataColumns`, cols));
          this.data.getDataTable(table['dataTableName'], dataTable => {

            // for each column
            //
            dataTable.getDataColumns(d => {
              console.log(`${table['dataTableName']}.getDataColumns`, _.pluck(d, 'dataColumnName'));
              this.marking.getMarkingNames(markingNames => {

                // for each marking
                //
                _.each(markingNames, markingName =>
                  this.marking.onChanged(markingName, table['dataTableName'], _.pluck(d, 'dataColumnName'), 10, res => {
                    if (_.size(res) > 0) {
                      // update the marked row if partial selection
                      //
                      if (!this.markedRows[table['dataTableName']]) {
                        this.markedRows[table['dataTableName']] = res;
                      } else {
                        _.extend(this.markedRows[table['dataTableName']], res);
                      }
                    } else if (this.markedRows[table['dataTableName']]) {
                      // remove the marked row if no marking
                      //
                      delete (this.markedRows[table['dataTableName']]);
                    }
                    this.markerSubject.next(this.markedRows);
                  }));
              });
            });
          });
        });
      });

      // Subscribe to markingEvent and emit the result to the Output
      //
      this.marker$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(f => {
        console.log('On detect un chg de marker', f); this.markingEvent.emit(f);
      });
    }
  }

  private loadFilters() {
    console.log('SpotfireComponent loadFilters', this.filterSubject);
    this.filtering.getAllModifiedFilterColumns(
      this.SPOTFIRE.webPlayer.includedFilterSettings.ALL_WITH_CHECKED_HIERARCHY_NODES, fs => {
        this.filterSubject.next(fs);
      });
  }
}
