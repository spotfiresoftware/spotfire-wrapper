/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import {
    addModuleImportToRootModule, getProjectFromWorkspace, getProjectMainFile,
    hasNgModuleImport
} from '@angular/cdk/schematics';

import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';

import { Schema } from './schema';

function addPackageToPackageJson(host: Tree, pkg: string, version: string, dev = false): Tree {
    function sortObjectByKeys(obj: object | any) {
        return Object.keys(obj).sort().reduce((result: any, key: any) => (result[key] = obj ? obj[key] : null) && result, {});
    }
    const depName = dev ? 'devDependencies' : 'dependencies';
    if (host.exists('package.json')) {
        const sourceText = host.read('package.json')!.toString('utf-8');
        const json = JSON.parse(sourceText);

        if (!json[depName]) {
            json[depName] = {};
        }

        if (!json[depName][pkg]) {
            json[depName][pkg] = version;
            json[depName] = sortObjectByKeys(json[depName]);
        }

        host.overwrite('package.json', JSON.stringify(json, null, 2));
    }
    return host;
}

export function ngAdd(_options: Schema): Rule {
    return (_host: Tree, context: SchematicContext) => {
        context.logger.log('info', `Installing @tibco/spotfire-wrapper`);
        addPackageToPackageJson(_host, '@angular/material', '~8.0.2');
        addPackageToPackageJson(_host, '@angular/cdk', '~8.0.2');
        addPackageToPackageJson(_host, '@angular/flex-layout', '~8.0.0-beta');

        const installTaskId = context.addTask(new NodePackageInstallTask());

        context.addTask(new RunSchematicTask('ng-add-setup-project', _options), [installTaskId]);
    };
}

export function ngAddSetup(_options: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const workspace = getWorkspace(tree);
        const project = getProjectFromWorkspace(workspace, _options.project);
        const appModulePath = getAppModulePath(tree, getProjectMainFile(project));

        const moduleName = 'SpotfireViewerModule';

        if (!hasNgModuleImport(tree, appModulePath, moduleName)) {
            context.logger.log('info', `Import  ${moduleName}`);
            addModuleImportToRootModule(tree, moduleName, '@tibco/spotfire-wrapper', project);
        }
        return tree;
    };
}
