import { MultiStepInput } from "@utils/MultiStepInput";
import {
  FileType,
  Uri,
  workspace,
  window,
  QuickPickItem,
  CancellationToken
} from "vscode";

export async function createFunctionOnPalette() {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;
  const rootPath = await workspace.fs.readDirectory(
    Uri.file(workspaceFolderPath)
  );
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
    const addons = await mapAvailableAddons(
      state.resourceGroup!,
      undefined /* TODO: token */
    );
    state.addon = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: "Pick A Addon",
      items: addons,
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
      Uri.file(`${workspaceFolderPath}/addons/${addonLabel}/functions`)
    );
    const statement =
      functions.find(file => file[0] === `fnc_${functionName}.sqf`) !==
      undefined;
    return statement ? "Function already present!" : undefined;
  }

  async function mapAvailableAddons(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const allItems = await workspace.fs.readDirectory(
      Uri.file(`${workspaceFolderPath}/addons`)
    );
    const folders = allItems.filter(
      ([_, fileType]) => fileType === FileType.Directory
    );
    return folders.map(([addon, _]) => ({ label: addon }));
  }

  const state = await collectInputs();

  // create
}
