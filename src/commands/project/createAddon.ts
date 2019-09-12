import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { MultiStepInput } from "@utils/MultiStepInput";

const config = vscode.workspace.getConfiguration("hemtt");

export async function createAddon() {
    const terminal = vscode.window.createTerminal();

    const folderPath = vscode.workspace.rootPath;

    const files = fs.readdirSync(folderPath!);

    if (!files.includes("hemtt.json")) {
        vscode.window.showErrorMessage(
            "A HEMTT Project does not exist in the current directory"
        );
        return;
    }

    interface IState {
        title: string;
        step: number;
        totalSteps: number;
        addonName: string;
    }

    async function collectInputs() {
        const state: Partial<IState> = {};
        await MultiStepInput.run(input => inputAddonName(input, state));
        return state as IState;
    }

    const title = "Create HEMTT Addon";

    async function inputAddonName(
        input: MultiStepInput,
        state: Partial<IState>
    ) {
        state.addonName = await input.showInputBox({
            title,
            step: 1,
            totalSteps: 1,
            value: typeof state.addonName === "string" ? state.addonName : "",
            prompt: "Enter Addon Name",
            validate: validateNameIsUnique,
            shouldResume
        });
    }

    function shouldResume() {
        // Could show a notification with the option to resume.
        return new Promise<boolean>(() => {});
    }

    async function validateNameIsUnique(name: string) {
        // ...validate...
        await new Promise(resolve => setTimeout(resolve, 1000));
        return name === "vscode" ? "Name not unique" : undefined;
    }

    const state = await collectInputs();

    const addons = fs.readdirSync(`${folderPath!}${path.sep}addons`);

    if (addons.includes(state.addonName)) {
        vscode.window.showErrorMessage(`${state.addonName} already exists`);
        return;
    }

    if (state.addonName === "") {
        vscode.window.showErrorMessage(`Invalid arguments.`);
        return;
    }

    terminal.sendText(`hemtt addon ${state.addonName}`);

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: `Creating HEMTT Addon: '${state.addonName}'`,
            cancellable: false
        },
        () => {
            return new Promise(resolve =>
                setTimeout(() => {
                    terminal.dispose();
                    resolve();
                }, 1000)
            );
        }
    );
}
