/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  TaskDefinition,
  Task,
  TaskGroup,
  WorkspaceFolder,
  RelativePattern,
  ShellExecution,
  Uri,
  workspace,
  TaskProvider,
  TextDocument,
  tasks,
  TaskScope,
  window
} from "vscode";
import * as path from "path";
import * as fs from "fs";
import minimatch = require("minimatch");
import {
  IStringMap,
  findAllJsonScripts,
  findAllJsonScriptRanges,
  findJsonScriptAtPosition
} from "./views/hemtt/jsonVisitors";
import {
  findAllTomlScripts,
  findAllTomlScriptsRanges,
  findTomlScriptAtPosition
} from "./views/hemtt/tomlVisitors";

export interface IHemttTaskDefinition extends TaskDefinition {
  script: string;
  path?: string;
}

type AutoDetect = "on" | "off";

let cachedTasks: Task[] | undefined;

export class HemttTaskProvider implements TaskProvider {
  constructor() {}

  public provideTasks() {
    return provideHemttScripts();
  }

  public resolveTask(_task: Task): Task | undefined {
    const hemttTask = _task.definition.script;
    if (hemttTask) {
      const kind: IHemttTaskDefinition = _task.definition as any;
      let hemttJsonUri: Uri;
      if (
        _task.scope === undefined ||
        _task.scope === TaskScope.Global ||
        _task.scope === TaskScope.Workspace
      ) {
        // scope is required to be a WorkspaceFolder for resolveTask
        return undefined;
      }
      if (kind.path) {
        hemttJsonUri = _task.scope.uri.with({
          path: _task.scope.uri.path + "/" + kind.path + "hemtt.json"
        });
      } else {
        hemttJsonUri = _task.scope.uri.with({
          path: _task.scope.uri.path + "/hemtt.json"
        });
      }
      return createTask(kind, `run ${kind.script}`, _task.scope, hemttJsonUri);
    }
    return undefined;
  }
}

export function invalidateTasksCache() {
  cachedTasks = undefined;
}

const buildNames: string[] = ["build", "compile", "watch"];
function isBuildTask(name: string): boolean {
  for (const buildName of buildNames) {
    if (name.indexOf(buildName) !== -1) {
      return true;
    }
  }
  return false;
}

const testNames: string[] = ["test"];
function isTestTask(name: string): boolean {
  for (const testName of testNames) {
    if (name === testName) {
      return true;
    }
  }
  return false;
}

function getPrePostScripts(scripts: any): Set<string> {
  const prePostScripts: Set<string> = new Set([
    "preuninstall",
    "postuninstall",
    "prepack",
    "postpack",
    "preinstall",
    "postinstall",
    "prepack",
    "postpack",
    "prepublish",
    "postpublish",
    "preversion",
    "postversion",
    "prestop",
    "poststop",
    "prerestart",
    "postrestart",
    "preshrinkwrap",
    "postshrinkwrap",
    "pretest",
    "postest",
    "prepublishOnly"
  ]);
  const keys = Object.keys(scripts);
  for (const script of keys) {
    const prepost = ["pre" + script, "post" + script];
    prepost.forEach(each => {
      if (scripts[each] !== undefined) {
        prePostScripts.add(each);
      }
    });
  }
  return prePostScripts;
}

export function isWorkspaceFolder(value: any): value is WorkspaceFolder {
  return value && typeof value !== "number";
}

export function getPackageManager(folder: WorkspaceFolder): string {
  return workspace
    .getConfiguration("hemtt", folder.uri)
    .get<string>("packageManager", "hemtt");
}

export async function hasHemttScripts(): Promise<boolean> {
  const folders = workspace.workspaceFolders;
  if (!folders) {
    return false;
  }
  try {
    for (const folder of folders) {
      if (isAutoDetectionEnabled(folder)) {
        const relativePattern = new RelativePattern(folder, "**/hemtt.toml") || new RelativePattern(folder, "**/hemtt.json");
        const paths = await workspace.findFiles(
          relativePattern,
          "**/include/**"
        );
        if (paths.length > 0) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function detectHemttScripts(): Promise<Task[]> {
  const emptyTasks: Task[] = [];
  const allTasks: Task[] = [];
  const visitedHemttJSONFiles: Set<string> = new Set();

  const folders = workspace.workspaceFolders;
  if (!folders) {
    return emptyTasks;
  }
  try {
    for (const folder of folders) {
      if (isAutoDetectionEnabled(folder)) {
        const relativePattern = new RelativePattern(folder, "**/hemtt.toml") || new RelativePattern(folder, "**/hemtt.json");
        const paths = await workspace.findFiles(
          relativePattern,
          "**/include/**"
        );
        for (const path of paths) {
          if (
            !isExcluded(folder, path) &&
            !visitedHemttJSONFiles.has(path.fsPath)
          ) {
            const tasks = await provideHemttScriptsForFolder(path);
            visitedHemttJSONFiles.add(path.fsPath);
            allTasks.push(...tasks);
          }
        }
      }
    }
    return allTasks;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function provideHemttScripts(): Promise<Task[]> {
  if (!cachedTasks) {
    cachedTasks = await detectHemttScripts();
  }
  return cachedTasks;
}

function isAutoDetectionEnabled(folder: WorkspaceFolder): boolean {
  return (
    workspace
      .getConfiguration("hemtt", folder.uri)
      .get<AutoDetect>("autoDetect") === "on"
  );
}

function isExcluded(folder: WorkspaceFolder, hemttJsonUri: Uri) {
  function testForExclusionPattern(path: string, pattern: string): boolean {
    return minimatch(path, pattern, { dot: true });
  }

  const exclude = workspace
    .getConfiguration("hemtt", folder.uri)
    .get<string | string[]>("exclude");
  const hemttJsonFolder = path.dirname(hemttJsonUri.fsPath);

  if (exclude) {
    if (Array.isArray(exclude)) {
      for (const pattern of exclude) {
        if (testForExclusionPattern(hemttJsonFolder, pattern)) {
          return true;
        }
      }
    } else if (testForExclusionPattern(hemttJsonFolder, exclude)) {
      return true;
    }
  }
  return false;
}

async function provideHemttScriptsForFolder(
  hemttJsonUri: Uri
): Promise<Task[]> {
  const emptyTasks: Task[] = [];

  const folder = workspace.getWorkspaceFolder(hemttJsonUri);
  if (!folder) {
    return emptyTasks;
  }
  const scripts = await getScripts(hemttJsonUri);
  if (!scripts) {
    return emptyTasks;
  }

  const result: Task[] = [];

  const prePostScripts = getPrePostScripts(scripts);
  Object.keys(scripts).forEach(each => {
    const task = createTask(each, `run ${each}`, folder!, hemttJsonUri);
    const lowerCaseTaskName = each.toLowerCase();
    if (isBuildTask(lowerCaseTaskName)) {
      task.group = TaskGroup.Build;
    } else if (isTestTask(lowerCaseTaskName)) {
      task.group = TaskGroup.Test;
    }
    if (prePostScripts.has(each)) {
      task.group = TaskGroup.Clean; // hack: use Clean group to tag pre/post scripts
    }
    // if (isDebugScript(scripts![each])) {
    //     task.group = TaskGroup.Rebuild; // hack: use Rebuild group to tag debug scripts
    // }
    result.push(task);
  });
  // always add hemtt build (without a problem matcher)
  result.push(createTask("build", "build", folder, hemttJsonUri, []));
  return result;
}

export function getTaskName(script: string, relativePath: string | undefined) {
  if (relativePath && relativePath.length) {
    return `${script} - ${relativePath.substring(0, relativePath.length - 1)}`;
  }
  return script;
}

export function createTask(
  script: IHemttTaskDefinition | string,
  cmd: string,
  folder: WorkspaceFolder,
  hemttJsonUri: Uri,
  matcher?: any
): Task {
  const kind: IHemttTaskDefinition =
    typeof script === "string" ? { type: "hemtt", script } : script;

  function getCommandLine(folder: WorkspaceFolder, cmd: string): string {
    const packageManager = getPackageManager(folder);
    return `${packageManager} ${cmd}`;
  }

  function getRelativePath(folder: WorkspaceFolder, hemttJsonUri: Uri): string {
    const rootUri = folder.uri;
    const absolutePath = hemttJsonUri.path.substring(
      0,
      hemttJsonUri.path.length - "hemtt.json".length
    );
    return absolutePath.substring(rootUri.path.length + 1);
  }

  const relativeHemttJson = getRelativePath(folder, hemttJsonUri);
  if (relativeHemttJson.length) {
    kind.path = getRelativePath(folder, hemttJsonUri);
  }
  const taskName = getTaskName(kind.script, relativeHemttJson);
  const cwd = path.dirname(hemttJsonUri.fsPath);
  return new Task(
    kind,
    folder,
    taskName,
    "hemtt",
    new ShellExecution(getCommandLine(folder, cmd), { cwd }),
    matcher
  );
}

export async function getHemttFileUriFromTask(task: Task): Promise<Uri | null> {
  return (await hasHemttFile()).isHemttToml
    ? getHemttTomlUriFromTask(task)
    : getHemttJsonUriFromTask(task);
}

function getHemttJsonUriFromTask(task: Task): Uri | null {
  if (isWorkspaceFolder(task.scope)) {
    if (task.definition.path) {
      return Uri.file(
        path.join(task.scope.uri.fsPath, task.definition.path, "hemtt.json")
      );
    } else {
      return Uri.file(path.join(task.scope.uri.fsPath, "hemtt.json"));
    }
  }
  return null;
}

function getHemttTomlUriFromTask(task: Task): Uri | null {
  if (isWorkspaceFolder(task.scope)) {
    if (task.definition.path) {
      return Uri.file(
        path.join(task.scope.uri.fsPath, task.definition.path, "hemtt.toml")
      );
    } else {
      return Uri.file(path.join(task.scope.uri.fsPath, "hemtt.toml"));
    }
  }
  return null;
}

interface IHemttFiles {
  isHemttToml: boolean;
  isHemttJson: boolean;
}

export async function hasHemttFile(): Promise<IHemttFiles> {
  const hemttFiles: IHemttFiles = {
    isHemttToml: false,
    isHemttJson: false
  };
  const folders = workspace.workspaceFolders;
  if (!folders) {
    return hemttFiles;
  }
  for (const folder of folders) {
    if (folder.uri.scheme === "file") {
      const hemttToml = path.join(folder.uri.fsPath, "hemtt.toml");
      const baseHemtt = path.join(folder.uri.fsPath, "./hemtt/base.toml");
      if ((await exists(hemttToml)) || (await exists(baseHemtt))) {
        hemttFiles.isHemttToml = true;
        hemttFiles.isHemttJson = false;
        return hemttFiles;
      } else {
        hemttFiles.isHemttToml = false;
        hemttFiles.isHemttJson = true;
        return hemttFiles;
      }
    }
  }
  return hemttFiles;
}

async function exists(file: string): Promise<boolean> {
  return new Promise<boolean>((resolve, _reject) => {
    fs.exists(file, value => {
      resolve(value);
    });
  });
}

async function readFile(file: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.toString());
    });
  });
}

export function runScript(script: string, document: TextDocument) {
  const uri = document.uri;
  const folder = workspace.getWorkspaceFolder(uri);
  if (folder) {
    const task = createTask(script, `run ${script}`, folder, uri);
    tasks.executeTask(task);
  }
}

async function findAllScripts(buffer: string): Promise<IStringMap> {
  return (await hasHemttFile()).isHemttToml
    ? findAllTomlScripts(buffer)
    : findAllJsonScripts(buffer);
}

export async function findAllScriptRanges(
  buffer: string
): Promise<Map<string, [number, number, string]>> {
  return (await hasHemttFile()).isHemttToml
    ? findAllTomlScriptsRanges(buffer)
    : findAllJsonScriptRanges(buffer);
}

export async function findScriptAtPosition(
  buffer: string,
  offset: number
): Promise<string | undefined> {
  return (await hasHemttFile()).isHemttToml
    ? findTomlScriptAtPosition(buffer, offset)
    : findJsonScriptAtPosition(buffer, offset);
}

export async function getScripts(
  hemttJsonUri: Uri
): Promise<IStringMap | undefined> {
  // prettier-ignore
  if (hemttJsonUri?.scheme !== "file") {
    return undefined;
  }

  const hemttJson = hemttJsonUri.fsPath;
  if (!(await exists(hemttJson))) {
    return undefined;
  }

  try {
    const contents = await readFile(hemttJson);
    const json = findAllScripts(contents); // JSON.parse(contents);
    return json;
  } catch (e) {
    const localizedParseError = `HEMTT task detection: failed to parse the file ${hemttJsonUri.fsPath}`;
    throw new Error(localizedParseError);
  }
}
