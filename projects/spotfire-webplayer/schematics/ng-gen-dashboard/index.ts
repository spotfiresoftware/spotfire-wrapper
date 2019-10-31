/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
import { normalize, strings, experimental } from '@angular-devkit/core';
import {
    Rule, Tree, move, chain, mergeWith, apply, url,
    applyTemplates, SchematicContext, SchematicsException
} from '@angular-devkit/schematics';
import { Schema } from './schema';
// import { addDeclarationToModule } from '@schematics/angular/utility/ast-utils';
export function ngGenDashboard(options: Schema): Rule {
    return (_tree: Tree, context: SchematicContext) => {
        const workspaceConfig = _tree.read('/angular.json');
        if (!workspaceConfig) {
            throw new SchematicsException('Could not find Angular workspace configuration');
        }

        // convert workspace to string
        const workspaceContent = workspaceConfig.toString();

        // parse workspace string into JSON object
        const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(workspaceContent);

        if (!options.project) {
            options.project = workspace.defaultProject;
        }

        const projectName = options.project as string;

        const project = workspace.projects[projectName];

        const projectType = project.projectType === 'application' ? 'app' : 'lib';

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
