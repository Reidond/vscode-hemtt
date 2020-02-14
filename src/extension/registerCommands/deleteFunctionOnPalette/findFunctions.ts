import { workspace, Uri, FileType } from "vscode";

export async function findAllFunctions(fullPath?: boolean) {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;

  const addonsFolders = await workspace.fs.readDirectory(
    Uri.file(`${workspaceFolderPath}/addons`)
  );

  const addons = addonsFolders.filter(
    ([_, fileType]) => fileType === FileType.Directory
  );

  const functions: Array<[string, FileType]> = [];

  for (const [addon, _] of addons) {
    const addonContent = await workspace.fs.readDirectory(
      Uri.file(`${workspaceFolderPath}/addons/${addon}`)
    );
    if (addonContent.find(folder => folder[0] === "functions")) {
      const functionContent = await workspace.fs.readDirectory(
        Uri.file(`${workspaceFolderPath}/addons/${addon}/functions`)
      );
      for (const func of functionContent) {
        const fileExtension =
          func[0].substring(func[0].lastIndexOf(".") + 1, func[0].length) ||
          func;
        if (fileExtension === "sqf" && !fullPath) {
          functions.push(func);
        }
        if (fullPath) {
          const file = `${workspaceFolderPath}/addons/${addon}/functions/${func}`;
          functions.push([file, FileType.File]);
        }
      }
    }
  }

  return functions;
}
