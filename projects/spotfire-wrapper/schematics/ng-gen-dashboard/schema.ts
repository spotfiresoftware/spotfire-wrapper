/*
* Copyright (c) 2019. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
export interface Schema {
    // The name of the service.
    name: string;
    // The path to create the service.
    path?: string;
    // The path to the swagger file.
    source?: string;
    // The name of the project.
    project?: string;
}
