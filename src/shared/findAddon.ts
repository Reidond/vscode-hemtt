import { workspace, Uri, FileType } from "vscode";

export async function findAddon(func: string): Promise<string> {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;

  const addonsFolders = await workspace.fs.readDirectory(
    Uri.file(`${workspaceFolderPath}/addons`)
  );
  const addons = addonsFolders.filter(
    ([_, fileType]) => fileType === FileType.Directory
  );
  for (const [localAddon, _] of addons) {
    const addonContent = await workspace.fs.readDirectory(
      Uri.file(`${workspaceFolderPath}/addons/${localAddon}`)
    );
    if (addonContent.find(folder => folder[0] === "functions")) {
      const functionContent = await workspace.fs.readDirectory(
        Uri.file(`${workspaceFolderPath}/addons/${localAddon}/functions`)
      );
      for (const [localFunc, _] of functionContent) {
        if (localFunc === func) {
          return localAddon;
        }
      }
    }
  }
  return "";
}
