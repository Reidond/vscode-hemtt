/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  TreeDataProvider,
  TreeItem,
  ExtensionContext,
  EventEmitter,
  Event,
  commands,
  Task,
  tasks,
  window,
  TextDocument,
  Uri,
  workspace,
  Selection
} from "vscode";
import { NoScripts } from "./NoScript";
import { HemttJSON } from "./HemttJSON";
import { Folder } from "./Folder";
import {
  getTaskName,
  getHemttFileUriFromTask,
  getScripts,
  createTask,
  isWorkspaceFolder,
  IHemttTaskDefinition,
  hasHemttFile
} from "../../tasks";
import { HemttScript } from "./HemttScript";
import { JSONVisitor, visit } from "jsonc-parser";
import * as path from "path";
import { HemttTOML } from "./HemttTOML";
import { findTomlScripts } from "./visitors/toml/tomlVisitor";
import { findJsonScripts } from "./visitors/json/jsonVisitor";

export class HemttScriptsTreeDataProvider
  implements TreeDataProvider<TreeItem> {
  private taskTree: Folder[] | HemttJSON[] | NoScripts[] | null = null;
  private extensionContext: ExtensionContext;
  private _onDidChangeTreeData: EventEmitter<TreeItem | null> = new EventEmitter<TreeItem | null>();
  // tslint:disable-next-line: member-ordering
  public readonly onDidChangeTreeData: Event<TreeItem | null> = this
    ._onDidChangeTreeData.event;

  constructor(context: ExtensionContext) {
    const subscriptions = context.subscriptions;
    this.extensionContext = context;
    subscriptions.push(
      commands.registerCommand("hemtt.view.runScript", this.runScript, this)
    );
    subscriptions.push(
      commands.registerCommand("hemtt.view.openScript", this.openScript, this)
    );
    subscriptions.push(
      commands.registerCommand("hemtt.view.refresh", this.refresh, this)
    );
    subscriptions.push(
      commands.registerCommand("hemtt.view.runBuild", this.runBuild, this)
    );
  }

  public refresh() {
    this.taskTree = null;
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: TreeItem): TreeItem {
    return element;
  }

  public getParent(element: TreeItem): TreeItem | null {
    if (element instanceof Folder) {
      return null;
    }
    if (element instanceof HemttJSON) {
      return element.folder;
    }
    if (element instanceof HemttTOML) {
      return element.folder;
    }
    if (element instanceof HemttScript) {
      return element.package;
    }
    if (element instanceof NoScripts) {
      return null;
    }
    return null;
  }

  public async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (!this.taskTree) {
      const taskItems = await tasks.fetchTasks({ type: "hemtt" });
      if (taskItems) {
        this.taskTree = this.buildTaskTree(taskItems);
        if (this.taskTree.length === 0) {
          this.taskTree = [new NoScripts()];
        }
      }
    }
    if (element instanceof Folder) {
      return element.hemttProjetFiles;
    }
    if (element instanceof HemttJSON) {
      return element.scripts;
    }
    if (element instanceof HemttTOML) {
      return element.scripts;
    }
    if (element instanceof HemttScript) {
      return [];
    }
    if (element instanceof NoScripts) {
      return [];
    }
    if (!element) {
      if (this.taskTree) {
        return this.taskTree;
      }
    }
    return [];
  }

  private scriptIsValid(scripts: any, task: Task): boolean {
    Object.entries(scripts).forEach((script): any => {
      const label = getTaskName(script[0], task.definition.path);
      if (task.name === label) {
        return true;
      }
      return false;
    });
    return false;
  }

  private async runScript(script: HemttScript) {
    const task = script.task;
    const uri = await getHemttFileUriFromTask(task);
    const scripts = await getScripts(uri!);

    // if (!this.scriptIsValid(scripts, task)) {
    //   this.scriptNotValid(task);
    //   return;
    // }

    tasks.executeTask(script.task);
  }

  private scriptNotValid(task: Task) {
    const message = `Could not find the script "${task.name}". Try to refresh the view.`;
    window.showErrorMessage(message);
  }

  private async findScript(
    document: TextDocument,
    script?: HemttScript
  ): Promise<number> {
    return (await hasHemttFile()).isHemttToml
      ? findTomlScripts(document, script)
      : findJsonScripts(document, script);
  }

  private async runBuild(selection: HemttJSON) {
    let uri: Uri | undefined;
    if (selection instanceof HemttJSON) {
      uri = selection.resourceUri;
    }
    if (!uri) {
      return;
    }
    const task = createTask(
      "build",
      "build",
      selection.folder.workspaceFolder,
      uri,
      []
    );
    tasks.executeTask(task);
  }

  private async openScript(selection: HemttJSON | HemttScript) {
    let uri: Uri | undefined;
    if (selection instanceof HemttJSON) {
      uri = selection.resourceUri!;
    } else if (selection instanceof HemttScript) {
      uri = selection.package.resourceUri;
    }
    if (!uri) {
      return;
    }
    const document: TextDocument = await workspace.openTextDocument(uri);
    const offset = await this.findScript(
      document,
      selection instanceof HemttScript ? selection : undefined
    );
    const position = document.positionAt(offset);
    await window.showTextDocument(document, {
      selection: new Selection(position, position)
    });
  }

  private isInstallTask(task: Task): boolean {
    const fullName = getTaskName("install", task.definition.path);
    return fullName === task.name;
  }

  private buildTaskTree(tasks: Task[]): Folder[] | HemttJSON[] | NoScripts[] {
    const folders: Map<string, Folder> = new Map();
    const packages: Map<string, HemttJSON> = new Map();

    let folder = null;
    let hemttJson = null;

    tasks.forEach(each => {
      if (isWorkspaceFolder(each.scope) && !this.isInstallTask(each)) {
        folder = folders.get(each.scope.name);
        if (!folder) {
          folder = new Folder(each.scope);
          folders.set(each.scope.name, folder);
        }
        const definition: IHemttTaskDefinition = each.definition as IHemttTaskDefinition;
        const relativePath = definition.path ? definition.path : "";
        const fullPath = path.join(each.scope.name, relativePath);
        hemttJson = packages.get(fullPath);
        if (!hemttJson) {
          hemttJson = new HemttJSON(folder, relativePath);
          folder.addHemttProjectFile(hemttJson);
          packages.set(fullPath, hemttJson);
        }
        const script = new HemttScript(this.extensionContext, hemttJson, each);
        hemttJson.addScript(script);
      }
    });
    if (folders.size === 1) {
      return [...packages.values()];
    }
    return [...folders.values()];
  }
}
