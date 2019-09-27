import {
  window,
  workspace,
  QuickPickItem,
  Uri,
  CancellationToken,
  FileType
} from "vscode";
import { MultiStepInput } from "@utils/MultiStepInput";
import { TextDecoder, TextEncoder } from "util";

export async function deleteFunctionOnPalette() {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;
  const rootPath = await workspace.fs.readDirectory(
    Uri.file(workspaceFolderPath)
  );
  const title = "Delete HEMTT Function";

  if (rootPath.find(file => file[0] === "hemtt.json") === undefined) {
    window.showErrorMessage(
      "A HEMTT Project does not exist in the current directory"
    );
    return;
  }

  interface IState {
    title: string;
    step: number;
    totalSteps: number;
    addon: QuickPickItem;
    functionName: QuickPickItem;
    resourceGroup: QuickPickItem | string;
  }

  async function collectInputs() {
    const state: Partial<IState> = {};
    await MultiStepInput.run(input => pickAddon(input, state));
    return state as IState;
  }

  async function pickAddon(input: MultiStepInput, state: Partial<IState>) {
    const addons = await getAvailableAddons(state.resourceGroup!, undefined);
    const functions = await searchAllFunctions(state.resourceGroup!, undefined);
    const items: QuickPickItem[] = [];
    state.addon = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: "Pick A Addon",
      items: items.concat(addons, functions),
      activeItem: state.addon,
      shouldResume
    });
    if (
      typeof state.addon !== "undefined" &&
      state.addon.label.charAt(0) === "@"
    ) {
      return (input: MultiStepInput) => pickFunction(input, state);
    } else {
      return undefined;
    }
  }

  async function pickFunction(input: MultiStepInput, state: Partial<IState>) {
    const functions = await getAvailableFunctions(
      state.addon,
      state.resourceGroup!,
      undefined
    );
    state.functionName = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: "Pick A Function",
      items: functions,
      activeItem: state.functionName,
      shouldResume
    });
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(() => {});
  }

  async function getAvailableAddons(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const addonsFolders = await workspace.fs.readDirectory(
      Uri.file(`${workspaceFolderPath}/addons`)
    );
    const addons = addonsFolders.filter(
      ([_, fileType]) => fileType === FileType.Directory
    );
    const functionlessAddons: Array<[string, FileType]> = [];
    for (const addon of addons) {
      const addonContent = await workspace.fs.readDirectory(
        Uri.file(`${workspaceFolderPath}/addons/${addon[0]}`)
      );
      if (addonContent.find(folder => folder[0] === "functions")) {
        functionlessAddons.push(addon);
      }
    }
    return functionlessAddons.map(([addon, _]) => ({ label: `@${addon}` }));
  }

  async function getAvailableFunctions(
    addon: QuickPickItem | undefined,
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const rawFunctions = await workspace.fs.readDirectory(
      Uri.file(
        `${workspaceFolderPath}/addons/${addon!.label.substring(1)}/functions`
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
    return functions.map(([func, _]) => ({ label: `${func}` }));
  }

  async function searchAllFunctions(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
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
          if (fileExtension === "sqf") {
            functions.push(func);
          }
        }
      }
    }

    return functions.map(([func, _]) => ({ label: `#${func}` }));
  }

  const state = await collectInputs();

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  if (typeof state.addon !== undefined && state.addon.label.charAt(0) === "@") {
    const addon = state.addon.label.substring(1);
    const funcContent = await workspace.fs.readFile(
      Uri.file(
        `${workspaceFolderPath}/addons/${addon}/functions/fnc_${state.functionName}.sqf`
      )
    );
    const prepPath = Uri.file(
      `${workspaceFolderPath}/addons/${addon}/XEH_PREP.hpp`
    );
    const prepContentEnc = await workspace.fs.readFile(prepPath);
    const prepContentDec = dec.decode(prepContentEnc);
  }

  if (typeof state.addon !== undefined && state.addon.label.charAt(0) === "#") {
    const func = state.addon.label.substring(1);
  }

  // await workspace.fs.writeFile(
  //   Uri.file(`${workspaceFolderPath}/addons/${addon}/functions/fnc_${functionName}.sqf`),
  //   functionContent
  // );

  // const prepPath = Uri.file(`${workspaceFolderPath}/addons/${addon}/XEH_PREP.hpp`);
  // const prepContentEnc = await workspace.fs.readFile(prepPath);
  // const prepContentDec = dec.decode(prepContentEnc);
  // const newPrepContent = enc.encode(
  //   prepContentDec + `PREP(${functionName});\n`
  // );
  // await workspace.fs.writeFile(prepPath, newPrepContent);
}
