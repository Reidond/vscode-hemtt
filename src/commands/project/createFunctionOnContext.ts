import { Uri, window, workspace } from "vscode";
import { MultiStepInput } from "@utils/MultiStepInput";
import { createFunction } from "@shared/createFunction";

export async function createFunctionOnContext(dir: Uri) {
    const dirArr = dir.path.split("/");
    dirArr.pop();
    const [addon] = dirArr.slice(-1);

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
        functionName: string;
    }

    async function collectInputs() {
        const state: Partial<IState> = {};
        await MultiStepInput.run(input => inputFunctionName(input, state));
        return state as IState;
    }

    async function inputFunctionName(
        input: MultiStepInput,
        state: Partial<IState>
    ) {
        state.functionName = await input.showInputBox({
            title,
            step: 1,
            totalSteps: 1,
            value:
                typeof state.functionName === "string"
                    ? state.functionName
                    : "",
            prompt: "Enter Function Name",
            validate: validateFunctionIsUnique,
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
        const functions = await workspace.fs.readDirectory(
            Uri.file(`${folderPath}/addons/${addon}/functions`)
        );
        const statement =
            functions.find(file => file[0] === `fnc_${functionName}.sqf`) !==
            undefined;
        return statement ? "Function already present!" : undefined;
    }

    const state = await collectInputs();

    await createFunction(addon, state.functionName);
}
