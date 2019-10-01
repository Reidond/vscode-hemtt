import { Uri, workspace, FileType } from "vscode";

export async function getAddonFunctions(addon: string) {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;

  const rawFunctions = await workspace.fs.readDirectory(
    Uri.file(
      `${workspaceFolderPath}/addons/${addon}/functions`
    )
  );
  const notFunctions = rawFunctions.filter(
    ([_, fileType]) => fileType === FileType.File
  );
  const functions = notFunctions.filter(([func, _]) => {
    const fileExtension =
      func.substring(func.lastIndexOf(".") + 1, func.length) || func;
    return fileExtension === "sqf";
  });

  return functions;
}
