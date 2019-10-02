import { workspace, Uri } from "vscode";
import { TextEncoder, TextDecoder } from "util";

export async function createFunction(addon: string, functionName: string) {
  const folderPath = workspace.rootPath;
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const functionContent = enc.encode('#include "script_component.hpp"');
  await workspace.fs.writeFile(
    Uri.file(`${folderPath}/addons/${addon}/functions/fnc_${functionName}.sqf`),
    functionContent
  );

  const prepPath = Uri.file(`${folderPath}/addons/${addon}/XEH_PREP.hpp`);
  const prepContentEnc = await workspace.fs.readFile(prepPath);
  const prepContentDec = dec.decode(prepContentEnc);
  const newPrepContent = enc.encode(
    prepContentDec + `PREP(${functionName});\n`
  );
  await workspace.fs.writeFile(prepPath, newPrepContent);
}
