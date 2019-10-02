import { Uri, workspace } from "vscode";
import eol from "eol";
import { TextEncoder, TextDecoder } from "util";

export async function deleteFunction(addon: string, func: string) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;

  const prepPath = Uri.file(
    `${workspaceFolderPath}/addons/${addon}/XEH_PREP.hpp`
  );
  const withoutFncPart = func.replace("fnc_", "");
  const withoutExtPart = withoutFncPart.replace(".sqf", "");
  const prepContentEnc = await workspace.fs.readFile(prepPath);
  const prepContentDec = dec.decode(prepContentEnc);
  const filteredPrepContent = eol
    .split(prepContentDec)
    .filter(line => line !== `PREP(${withoutExtPart});`)
    .join("\n");
  await workspace.fs.writeFile(
    Uri.file(`${workspaceFolderPath}/addons/${addon}/XEH_PREP.hpp`),
    enc.encode(filteredPrepContent)
  );
  await workspace.fs.delete(
    Uri.file(`${workspaceFolderPath}/addons/${addon}/functions/${func}`)
  );
}
