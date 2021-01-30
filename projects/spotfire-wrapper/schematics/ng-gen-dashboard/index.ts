/*
* Copyright (c) 2019-2021. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

import { normalize, strings, virtualFs, workspaces } from '@angular-devkit/core';
import {
  apply, applyTemplates, chain,
  mergeWith, move, url, Rule,
  SchematicsException, SchematicContext,
  Tree
} from '@angular-devkit/schematics';

import { Schema } from './schema';

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

// import { addDeclarationToModule } from '@schematics/angular/utility/ast-utils';
export function ngGenDashboard(options: Schema): Rule {
  return async (_tree: Tree, context: SchematicContext) => {

    const host = createHost(_tree);
    const { workspace } = await workspaces.readWorkspace('/', host);

    if (!options.project) {
      options.project = workspace.extensions.defaultProject as string;
    }

    const project = workspace.projects.get(options.project);
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${options.project}`);
    }

    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';

    if (options.path === undefined) {
      options.path = `${project.sourceRoot}/${projectType}`;
    }

    context.logger.log('info', `Generate Component for dahboard '${strings.dasherize(options.name)}'`);
    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name: options.name
      }),
      move(normalize(options.path as string))
    ]);
    context.logger.log('info', `now add '${strings.dasherize(options.name)}Component' in 'declarations' of your @ngModule`);
    return chain([
      mergeWith(templateSource)
    ]);
  };
}
