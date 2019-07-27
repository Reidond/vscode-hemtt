import * as vscode from "vscode";

const config = vscode.workspace.getConfiguration("hemtt");

export function create() {
    vscode.window.showInformationMessage("Creating project");
}
