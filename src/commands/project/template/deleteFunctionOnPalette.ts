import {
  window,
  workspace,
  QuickPickItem,
  Uri,
  CancellationToken,
  FileType
} from "vscode";
import { MultiStepInput } from "../../../utils/MultiStepInput";
import { findAddon } from "../../../shared/findAddon";
import { findAllFunctions } from "../../../shared/findFunctions";
import { getAddonFunctions } from "../../../shared/getAddonFunctions";
import { getAddons } from "../../../shared/getAddons";

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
    const addons = await mapAvailableAddons(state.resourceGroup!, undefined);
    const functions = await mapAllFunctions(state.resourceGroup!, undefined);
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
      !state.addon.label.includes(".sqf")
    ) {
      return (input: MultiStepInput) => pickFunction(input, state);
    } else {
      return undefined;
    }
  }

  async function pickFunction(input: MultiStepInput, state: Partial<IState>) {
    const functions = await mapAvailableFunctions(
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

  async function mapAvailableAddons(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const addons = await getAddons();
    return addons.map(([addon, _]) => ({ label: `${addon}` }));
  }

  async function mapAvailableFunctions(
    addon: QuickPickItem | undefined,
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const functions = await getAddonFunctions(addon!.label);
    return functions.map(([func, _]) => ({ label: `${func}` }));
  }

  async function mapAllFunctions(
    _resourceGroup: QuickPickItem | string,
    _token?: CancellationToken
  ): Promise<QuickPickItem[]> {
    const functions: Array<[string, FileType]> = await findAllFunctions();
    return functions.map(([func, _]) => ({ label: `${func}` }));
  }

  const state = await collectInputs();

  if (typeof state.addon !== undefined && !state.addon.label.includes(".sqf")) {
    const addon = state.addon.label;
    // delete
  }

  if (typeof state.addon !== undefined && state.addon.label.includes(".sqf")) {
    const func = state.addon.label;
    const addon: string = await findAddon(func);
    // delete
  }
}
