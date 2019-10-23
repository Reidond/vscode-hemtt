import { createTask } from "../../../tasks";
import { workspace, window, ProgressLocation, tasks } from "vscode";
import { getHEMTTFile } from "../../../utils/getHEMTTFile";

export function buildReleaseOnPalette() {
  const workspaceFolder = workspace.workspaceFolders![0];

  const task = createTask(
    "build",
    `build --release`,
    workspaceFolder,
    getHEMTTFile()
  );

  window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `Building project`,
      cancellable: false
    },
    () => tasks.executeTask(task)
  );
}
