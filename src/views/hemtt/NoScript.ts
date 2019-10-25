/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TreeItem, TreeItemCollapsibleState } from "vscode";

export class NoScripts extends TreeItem {
  constructor() {
    super("No scripts found", TreeItemCollapsibleState.None);
    this.contextValue = "noscripts";
  }
}
