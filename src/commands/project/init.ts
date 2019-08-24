import * as vscode from "vscode";
import * as fs from "fs";
import { MultiStepInput } from "../../MultiStepInput";

const config = vscode.workspace.getConfiguration("hemtt");

export async function init() {
  const folderPath = vscode.workspace.rootPath;

  const files = fs.readdirSync(folderPath!);

  if (files.includes("hemtt.json")) {
    vscode.window.showErrorMessage(
      "HEMTT Project already exists in the current directory"
    );
    return;
  }

  const terminal = vscode.window.createTerminal();
  terminal.sendText("hemtt init");

  interface IState {
    title: string;
    step: number;
    totalSteps: number;
    projectName: string;
    prefix: string;
    author: string;
  }

  async function collectInputs() {
    const state: Partial<IState> = {};
    await MultiStepInput.run(input => inputProjectName(input, state));
    return state as IState;
  }

  const title = "Init HEMTT Project";

  async function inputProjectName(
    input: MultiStepInput,
    state: Partial<IState>
  ) {
    state.projectName = await input.showInputBox({
      title,
      step: 1,
      totalSteps: 3,
      value:
        typeof state.projectName === "string"
          ? state.projectName
          : "My Cool Mod",
      prompt: "Project Name (My Cool Mod)",
      validate: validateNameIsUnique,
      shouldResume
    });
    return (input: MultiStepInput) => inputPrefix(input, state);
  }

  async function inputPrefix(input: MultiStepInput, state: Partial<IState>) {
    state.prefix = await input.showInputBox({
      title,
      step: 2,
      totalSteps: 3,
      value: typeof state.prefix === "string" ? state.prefix : "MCM",
      prompt: "Prefix (MCM)",
      validate: validateNameIsUnique,
      shouldResume
    });
    return (input: MultiStepInput) => inputAuthor(input, state);
  }

  async function inputAuthor(input: MultiStepInput, state: Partial<IState>) {
    state.author = await input.showInputBox({
      title,
      step: 3,
      totalSteps: 3,
      value: state.author || "Me",
      prompt: "Author (Me)",
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
  vscode.window.showInformationMessage(
    `Initializing HEMTT Project: '${state.projectName}'`
  );

  terminal.sendText(state.projectName);
  terminal.sendText(state.prefix);
  terminal.sendText(state.author);
}
