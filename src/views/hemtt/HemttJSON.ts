/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TreeItem, TreeItemCollapsibleState, Uri, ThemeIcon } from "vscode";
import * as path from "path";
import { Folder } from "./Folder";
import { HemttScript } from "./HemttScript";

const packageName = "hemtt.json";

export class HemttJSON extends TreeItem {
    public static getLabel(_folderName: string, relativePath: string): string {
        if (relativePath.length > 0) {
            return path.join(relativePath, packageName);
        }
        return packageName;
    }

    public path: string;
    public folder: Folder;
    public scripts: HemttScript[] = [];

    constructor(folder: Folder, relativePath: string) {
        super(
            HemttJSON.getLabel(folder.label!, relativePath),
            TreeItemCollapsibleState.Expanded
        );
        this.folder = folder;
        this.path = relativePath;
        this.contextValue = "packageJSON";
        this.resourceUri = relativePath
            ? Uri.file(
                  path.join(
                      folder!.resourceUri!.fsPath,
                      relativePath,
                      packageName
                  )
              )
            : Uri.file(path.join(folder!.resourceUri!.fsPath, packageName));
        this.iconPath = ThemeIcon.File;
    }

    public addScript(script: HemttScript) {
        this.scripts.push(script);
    }
}
