import { workspace, Uri, FileType } from "vscode";

export async function getAddons() {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;

  const allItems = await workspace.fs.readDirectory(
    Uri.file(`${workspaceFolderPath}/addons`)
  );
  const folders = allItems.filter(
    ([_, fileType]) => fileType === FileType.Directory
  );
  const addons: Array<[string, FileType]> = [];
  for (const folder of folders) {
    const addonContent = await workspace.fs.readDirectory(
      Uri.file(`${workspaceFolderPath}/addons/${folder[0]}`)
    );
    if (addonContent.find(folder => folder[0] === "functions")) {
      addons.push(folder);
    }
  }

  return addons;
}
