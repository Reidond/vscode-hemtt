import { createTask } from "..\..\runSelectedScript\tasks";
import { workspace, window, ProgressLocation, tasks } from "vscode";
import { getHEMTTFile } from "./createAddon\getHEMTTFile";

export async function buildOnPalette() {
  const workspaceFolder = workspace.workspaceFolders![0];

  const task = await createTask("build", `build`, workspaceFolder, getHEMTTFile());

  window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `Building project`,
      cancellable: false
    },
    () => tasks.executeTask(task)
  );
}