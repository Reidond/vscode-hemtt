/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  TreeItem,
  Task,
  ExtensionContext,
  TreeItemCollapsibleState,
  workspace,
  TaskGroup,
  WorkspaceFolder,
  Uri
} from "vscode";
import { HemttJSON } from "./HemttJSON";
import * as path from "path";
import { getScripts, getHemttFileUriFromTask } from "../../tasks";
import { HemttTOML } from "./HemttTOML";

type ExplorerCommands = "open" | "run";

export class HemttScript extends TreeItem {
  public task: Task;
  public package: HemttJSON | HemttTOML;

  constructor(
    context: ExtensionContext,
    hemttFile: HemttJSON | HemttTOML,
    task: Task
  ) {
    super(task.name, TreeItemCollapsibleState.None);
    const command: ExplorerCommands =
      workspace
        .getConfiguration("hemtt")
        .get<ExplorerCommands>("scriptExplorerAction") || "open";

    const commandList = {
      open: {
        title: "Edit Script",
        command: "npm.openScript",
        arguments: [this]
      },
      run: {
        title: "Run Script",
        command: "npm.runScript",
        arguments: [this]
      }
    };
    this.contextValue = "script";
    if (task.group && task.group === TaskGroup.Rebuild) {
      this.contextValue = "debugScript";
    }
    this.package = hemttFile;
    this.task = task;
    this.command = commandList[command];

    if (task.group && task.group === TaskGroup.Clean) {
      this.iconPath = {
        light: context.asAbsolutePath(
          path.join("resources", "light", "prepostscript.svg")
        ),
        dark: context.asAbsolutePath(
          path.join("resources", "dark", "prepostscript.svg")
        )
      };
    } else {
      this.iconPath = {
        light: context.asAbsolutePath(
          path.join("resources", "light", "script.svg")
        ),
        dark: context.asAbsolutePath(
          path.join("resources", "dark", "script.svg")
        )
      };
    }

    let uri: Uri | null;

    getHemttFileUriFromTask(task).then(localUri => (uri = localUri));

    getScripts(uri!).then(scripts => {
      if (scripts && scripts[task.definition.script]) {
        this.tooltip = scripts[task.definition.script];
      }
    });
  }

  public getFolder(): WorkspaceFolder {
    return this.package.folder.workspaceFolder;
  }
}
