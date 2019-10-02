import { TextEncoder, TextDecoder } from "util";
import { findAddon } from "./findAddon";
import { workspace, Uri } from "vscode";
import eol from "eol";

export async function moveFunction(addon: string, func: string) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;

  const sourceAddon = await findAddon(func);

  const sourcePrepPath = Uri.file(
    `${workspaceFolderPath}/addons/${sourceAddon}/XEH_PREP.hpp`
  );
  const withoutFncPart = func.replace("fnc_", "");
  const withoutExtPart = withoutFncPart.replace(".sqf", "");
  const sourcePrepContentEnc = await workspace.fs.readFile(sourcePrepPath);
  const sourcePrepContentDec = dec.decode(sourcePrepContentEnc);
  const filteredPrepContent = eol
    .split(sourcePrepContentDec)
    .filter(line => line !== `PREP(${withoutExtPart});`)
    .join("\n");
  await workspace.fs.writeFile(
    Uri.file(`${workspaceFolderPath}/addons/${sourceAddon}/XEH_PREP.hpp`),
    enc.encode(filteredPrepContent)
  );

  const prepPath = Uri.file(
    `${workspaceFolderPath}/addons/${addon}/XEH_PREP.hpp`
  );
  const prepContentEnc = await workspace.fs.readFile(prepPath);
  const prepContentDec = dec.decode(prepContentEnc);
  const newPrepContent = enc.encode(
    prepContentDec + `PREP(${withoutExtPart});\n`
  );
  await workspace.fs.writeFile(
    Uri.file(`${workspaceFolderPath}/addons/${addon}/XEH_PREP.hpp`),
    newPrepContent
  );

  const funcUri = Uri.file(
    `${workspaceFolderPath}/addons/${sourceAddon}/functions/${func}`
  );
  const dest = Uri.file(
    `${workspaceFolderPath}/addons/${addon}/functions/${func}`
  );
  await workspace.fs.copy(funcUri, dest);
  await workspace.fs.delete(funcUri);
}
