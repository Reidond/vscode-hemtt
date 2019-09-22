import {
  window,
  workspace,
  QuickPickItem,
  Uri,
  CancellationToken,
  FileType
} from "vscode";
import { MultiStepInput } from "@utils/MultiStepInput";

export async function deleteFunctionOnPalette() {
  const folderPath = workspace.rootPath;
  const rootPath = await workspace.fs.readDirectory(Uri.file(folderPath!));
  const title = "Create HEMTT Function";

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
    functionName: string;
    resourceGroup: QuickPickItem | string;
  }

  async function collectInputs() {
    const state: Partial<IState> = {};
    await MultiStepInput.run(input => pickAddon(input, state));
    return state as IState;
  }

  async function pickAddon(input: MultiStepInput, state: Partial<IState>) {
    const addons = await getAvailableAddons(
      state.resourceGroup!,
      undefined /* TODO: token */
    );
    const functions = await searchAllFunctions(
      state.resourceGroup!,
      undefined /* TODO: token */
    );
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
    return (input: MultiStepInput) => inputFunctionName(input, state);
  }

  async function inputFunctionName(
    input: MultiStepInput,
    state: Partial<IState>
  ) {
    state.functionName = await input.showInputBox({
      title,
      step: 2,
      totalSteps: 2,
      value: typeof state.functionName === "string" ? state.functionName : "",
      prompt: "Enter Function Name",
      validate: validateFunctionIsUnique.bind(state),
      shouldResume
    });
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(() => {});
  }

  async function validateFunctionIsUnique(
    this: Partial<IState>,
    functionName: string
  ) {
    const addonLabel = this.addon!.label;
    const functions = await workspace.fs.readDirectory(
      Uri.file(`${folderPath}/addons/${addonLabel}/functions`)
    );
    const statement =
      functions.find(file => file[0] === `fnc_${functionName}.sqf`) !==
      undefined;
    return statement ? "Function already present!" : undefined;
  }

  async function getAvailableAddons(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const addonsFolders = await workspace.fs.readDirectory(
      Uri.file(`${folderPath}/addons`)
    );
    const addons = addonsFolders.filter(
      ([_, fileType]) => fileType === FileType.Directory
    );
    return addons.map(([addon, _]) => ({ label: addon }));
  }

  async function searchAllFunctions(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const addonsFolders = await workspace.fs.readDirectory(
      Uri.file(`${folderPath}/addons`)
    );
    const addons = addonsFolders.filter(
      ([_, fileType]) => fileType === FileType.Directory
    );

    const functions: Array<[string, FileType]> = [];
    addons.forEach(async ([addon, _]) => {
      const addonContent = await workspace.fs.readDirectory(
        Uri.file(`${folderPath}/addons/${addon}`)
      );
      if (
        addonContent.find(folder => folder[0] === "functions") !== undefined
      ) {
        const functionContent = await workspace.fs.readDirectory(
          Uri.file(`${folderPath}/addons/${addon}/functions`)
        );
        functionContent.forEach(func => {
          const fileExtension =
            func[0].substring(func[0].lastIndexOf(".") + 1, func[0].length) ||
            func;
          if (fileExtension === "sqf") {
            functions.push(func);
          }
        });
      }
    });

    return functions.map(([func, _]) => ({ label: func }));
  }

  const state = await collectInputs();
}
