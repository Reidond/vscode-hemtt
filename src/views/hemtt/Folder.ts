/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  TreeItem,
  WorkspaceFolder,
  TreeItemCollapsibleState,
  ThemeIcon
} from "vscode";
import { HemttJSON } from "./HemttJSON";

export class Folder extends TreeItem {
  public hemttProjetFiles: HemttJSON[] = [];
  public workspaceFolder: WorkspaceFolder;

  constructor(folder: WorkspaceFolder) {
    super(folder.name, TreeItemCollapsibleState.Expanded);
    this.contextValue = "folder";
    this.resourceUri = folder.uri;
    this.workspaceFolder = folder;
    this.iconPath = ThemeIcon.Folder;
  }

  public addHemttProjectFile(packageJson: HemttJSON) {
    this.hemttProjetFiles.push(packageJson);
  }
}
