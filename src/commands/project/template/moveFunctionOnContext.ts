import {
  Uri,
  workspace,
  window,
  QuickPickItem,
  CancellationToken
} from "vscode";
import { MultiStepInput } from "@utils/MultiStepInput";
import { getAddons } from "@shared/getAddons";

export async function moveFunctionOnContext(dir: Uri) {
  const dirArr = dir.path.split("/");
  const func = dirArr.pop();

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
    resourceGroup: QuickPickItem | string;
  }

  async function collectInputs() {
    const state: Partial<IState> = {};
    await MultiStepInput.run(input => pickAddon(input, state));
    return state as IState;
  }

  async function pickAddon(input: MultiStepInput, state: Partial<IState>) {
    const addons = await mapAvailableAddons(state.resourceGroup!, undefined);
    state.addon = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 1,
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

  const state = await collectInputs();

  // move
}
