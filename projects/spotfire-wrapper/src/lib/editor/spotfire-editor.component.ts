/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { DocumentService } from '../document.service';
import { PersistanceService } from '../persitence.service';
import { SpotfireCustomization, SpotfireFilter } from '../spotfire-customization';
import { CUSTLABELS, Document as SpotDoc } from '../spotfire-webplayer';
import { SpotfireViewerComponent } from '../viewer/spotfire-viewer.component';
import { SpotfireServerService } from '../spotfire-server.service';

@Component({
    selector: 'spotfire-editor',
    templateUrl: 'spotfire-editor.component.html',
    exportAs: 'spotfireEditor',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./my-theme.scss', './spotfire-editor.component.scss']
})
export class SpotfireEditorComponent extends SpotfireViewerComponent {
    form: FormGroup;
    /**
     * When user hits Update button, depending on what settings are modified, call the right level of
     * method to update the dashboard
     */
    dataTables = {};
    pages = [];
    possibleValues = '';
    custLabels = CUSTLABELS;

    constructor(public fb: FormBuilder,
        private storSvc: PersistanceService,
        d: DocumentService,
        spotfireServerSvc: SpotfireServerService) {
        super(d, spotfireServerSvc);
    }

    update = (e) => {
        this.edit = false;
        e.stopPropagation();
        const isD = (z) => this.form.get(z).dirty;
        const onlyTrueProps = (t) => Object.keys(t).filter(key => t[key] === true)
            .reduce((obj, key) => { obj[key] = t[key]; return obj; }, {});
        // console.log('[SPOTFIRE-EDITOR] SpotfireEditorComponent Update', this.form.getRawValue(),
        // `u:${isD('url')}, p:${isD('path')}, a:${isD('page')}, c:${isD('cust')}, f:${isD('filters')}, m:${isD('marking')}`);
        const cus = new SpotfireCustomization(this.form.get('cust').value);
        if (isD('url')) {
            this.docSvc.openWebPlayer$(this.spotParams).subscribe();
            //            this.openWebPlayer(this.form.get('url').value, this.form.get('path').value, cus);
        } else if (isD('path') || isD('filters') || isD('marking') || isD('cust')) {
            this.path = isD('path') ? this.form.get('path').value : this.path;
            this.page = isD('page') ? this.form.get('page').value : this.page;
            // console.log('[SPOTFIRE-EDITOR] Marking : ', this.form.get('marking').value);
            this.customization = cus;
            this.pages = [];
            const allFilters: Array<SpotfireFilter> = [];
            if (this.form.get('filters').value) {
                const fltersValue = this.form.get('filters').value;
                Object.keys(fltersValue).forEach(dataTableName => {
                    const flt = fltersValue[dataTableName];
                    Object.keys(flt).forEach(dataColumnName =>
                        allFilters.push(new SpotfireFilter({
                            dataTableName: dataTableName,
                            dataColumnName: dataColumnName,
                            filterSettings: { values: flt[dataColumnName] }
                        })));
                });
            }
            this.filters = allFilters;
            if (this.sid) {
                this.storSvc.set('url', this.form.get('url').value);
                this.storSvc.set('path', this.form.get('path').value);
                this.storSvc.set('page', this.form.get('page').value);
                this.storSvc.set('cust', onlyTrueProps(this.customization));
                this.storSvc.set('flts', this.filters);
                this.storSvc.set('mark', this.markingOn);
            }
            this.docSvc.openPath$(this.spotParams).subscribe();
        } else if (isD('page')) {
            // if only page has changed, just refresh it
            //
            if (this.sid) {
                this.storSvc.set('page', this.form.get('page').value);
            }
            this.docSvc.openPage$(this.form.get('page').value).subscribe();
        }
    }
    doForm(doc: SpotDoc) {

        this.form = this.fb.group({
            url: [this.url, Validators.required],
            path: [this.path, Validators.required],
            page: this.fb.control({ value: this.page, disabled: false }), // !this.url }),
            cust: this.fb.group(this.customization as SpotfireCustomization),
            filters: this.fb.group({}),
            marking: this.fb.group({})
        });

        // then subscribe to observables to retrieves some info about the document
        //
        doc.getDocumentMetadata$().subscribe(g => this.metadata = g);
        /*  doc.getDocumentProperties$().subscribe(g => console.log('--> getDocumentProperties', g));
          doc.getBookmarks$().subscribe(g => console.log('--> getBookmarks', g));
          doc.getBookmarkNames$().subscribe(g => console.log('--> getBookmarkNames', g));
          doc.getReports$().subscribe(g => console.log('--> getReports', g));
          */
        doc.getPages$().subscribe(g => this.pages = g);
        doc.getActivePage$().subscribe(g => this.form.get('page').patchValue(g.pageTitle));

        //   this.doc.exportActiveVisualAsImage(100, 200);
        // this.marking = doc.marking;
        //  this.marking.getMarkingNames(g => console.log('SFINFO', 'getMarkingNames() = ', g));

        // get Table info
        //
        const difference = (a, b) => b.filter(i => a.indexOf(i) < 0);
        doc.onDocumentReady$().subscribe(__ => {
            doc.getData().getAllTables$().subscribe(tables => {
                // console.log('[SPOTFIRE-EDITOR] getAllTables$ returns', tables, this.filters, this.markingOn);
                const toList = (g) => g.map(f => `'${f}'`).join(', '),
                    errTxt1 = '[spotfire-EDITOr] Attribut marking-on contains unknwon',
                    errTxt2 = '[spotfire-EDITOr] Possible values for',
                    fil: FormGroup = this.form.get('filters') as FormGroup,
                    mar: FormGroup = this.form.get('marking') as FormGroup,
                    tNames = Object.keys(tables),
                    tdiff = this.markingOn ? difference(Object.keys(this.markingOn), tNames) : [];
                // console.log('Tables : ', tNames, tdiff, fil);

                if (tdiff.length > 0) {
                    this.errorMessages.push(`${errTxt1} table names: ${toList(tdiff)}`);
                    this.possibleValues = `${errTxt2} table names are: ${toList(tNames)} `;
                    //        return;
                }

                // Update marking and filters fields
                //
                Object.keys(tables).forEach(tname => {
                    const columns = tables[tname];
                    mar.addControl(tname, new FormControl(this.markingOn ? this.markingOn[tname] : null));
                    if (!fil.contains(tname)) {
                        fil.addControl(tname, new FormGroup({}));
                    }
                    const frm: FormGroup = fil.get(tname) as FormGroup;
                    const cNames = Object.keys(columns);
                    /*
                    console.log('Columns : ', cNames, this.markingOn);
                    if (this.markingOn) {
                      const cdiff = this.markingOn[tname] ? this.difference(this.markingOn[tname], cNames) : [];
                      console.log('Columns : ', cNames, cdiff);
                      if (_.size(cdiff) > 0) {
                        this.errorMessages.push(`${errTxt1} column names: ${toList(cdiff)}`);
                        this.possibleValues = `${errTxt2} columns of table ${tname} are: ${toList(cNames)} `;
                        //          return;
                      }
                    }
                    */

                    cNames.forEach(cname => {
                        let flt2 = null;
                        (this.filters as SpotfireFilter[] || []).some(element => {
                            if (element.dataTableName === tname && element.dataColumnName === cname) {
                                flt2 = element;
                                return true;
                            }
                        });
                        frm.addControl(cname, new FormControl(flt2 ? flt2.filterSettings.values : null));
                    });
                });
                this.dataTables = tables;
            });
        });
    }
}
