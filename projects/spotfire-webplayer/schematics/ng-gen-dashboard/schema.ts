// Copyright (c) 2019-2019. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
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
