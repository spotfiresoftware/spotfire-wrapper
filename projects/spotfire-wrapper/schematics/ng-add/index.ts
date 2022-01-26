/*
* Copyright (c) 2019-2021. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { addModuleImportToRootModule, getProjectFromWorkspace, getProjectMainFile, hasNgModuleImport } from '@angular/cdk/schematics';

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { Schema } from './schema';

export const ngAdd = (_options: Schema): Rule => (tree: Tree, context: SchematicContext) => {
  context.logger.log('info', `Installing @tibcosoftware/spotfire-wrapper`);
  const installTaskId = context.addTask(new NodePackageInstallTask());
  context.addTask(new RunSchematicTask('ng-add-setup-project', _options), [installTaskId]);
  return tree;
};

export const ngAddSetup = (_options: Schema): Rule => (tree: Tree, context: SchematicContext) => {
  getWorkspace(tree).then(workspace => {

    const project = getProjectFromWorkspace(workspace, _options.project);
    const appModulePath = getAppModulePath(tree, getProjectMainFile(project));

    const moduleName = 'SpotfireViewerModule';

    if (!hasNgModuleImport(tree, appModulePath, moduleName)) {
      context.logger.log('info', `Import  ${moduleName}`);
      addModuleImportToRootModule(tree, moduleName, '@tibcosoftware/spotfire-wrapper', project);
    }
    return tree;
  });
};

