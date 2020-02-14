import { workspace, window, Uri } from "vscode";
import * as fs from "fs";

export function getHEMTTFile() {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;

  const files = fs.readdirSync(workspaceFolderPath!);

  if (files.includes("hemtt.toml")) {
    window.showErrorMessage(
      "A HEMTT Project does not exist in the current directory"
    );

    return Uri.file(`${workspaceFolderPath}/hemtt.toml`);
  }

  if (files.includes("hemtt.json")) {
    window.showErrorMessage(
      "A HEMTT Project does not exist in the current directory"
    );

    return Uri.file(`${workspaceFolderPath}/hemtt.json`);
  }

  // Try to return base hemtt file
  return Uri.file(`${workspaceFolderPath}/.hemtt/base.toml`);
}
