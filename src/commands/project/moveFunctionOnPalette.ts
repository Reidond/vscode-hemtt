import {
  QuickPickItem,
  CancellationToken,
  FileType,
  window,
  Uri,
  workspace
} from "vscode";
import { getAddons } from "@shared/getAddons";
import { findAllFunctions } from "@shared/findFunctions";
import { MultiStepInput } from "@utils/MultiStepInput";

export async function moveFunctionOnPalette() {
  const workspaceFolder = workspace.workspaceFolders![0];
  const workspaceFolderPath = workspaceFolder.uri.path;
  const rootPath = await workspace.fs.readDirectory(
    Uri.file(workspaceFolderPath)
  );
  const title = "Move HEMTT Function";

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
    await MultiStepInput.run(input => pickFunction(input, state));
    return state as IState;
  }

  async function pickFunction(input: MultiStepInput, state: Partial<IState>) {
    const functions = await mapAllFunctions(state.resourceGroup!, undefined);
    state.functionName = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: "Pick A Function",
      items: functions,
      activeItem: state.functionName,
      shouldResume
    });
    return (input: MultiStepInput) => pickAddon(input, state);
  }

  async function pickAddon(input: MultiStepInput, state: Partial<IState>) {
    const addons = await mapAvailableAddons(state.resourceGroup!, undefined);
    state.addon = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: "Pick A Addon",
      items: addons,
      activeItem: state.addon,
      shouldResume
    });
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(() => {});
  }

  async function mapAvailableAddons(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const addons = await getAddons();
    return addons.map(([addon, _]) => ({ label: `${addon}` }));
  }

  async function mapAllFunctions(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const functions: Array<[string, FileType]> = await findAllFunctions();
    return functions.map(([func, _]) => ({ label: `${func}` }));
  }

  const state = await collectInputs();

  // move
}
