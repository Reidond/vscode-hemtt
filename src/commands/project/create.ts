import * as vscode from "vscode";

const config = vscode.workspace.getConfiguration("hemtt");

export async function create(): Promise<void> {
    const terminal = vscode.window.createTerminal();

    terminal.sendText("hemtt create");

    const projectName = await vscode.window.showInputBox({
        placeHolder: "Project Name (My Cool Mod)"
    });
    if (typeof projectName === "undefined") {
        terminal.dispose();
        return;
    }
    terminal.sendText(projectName);

    const prefix = await vscode.window.showInputBox({
        placeHolder: "Prefix (MCM)"
    });
    if (typeof prefix === "undefined") {
        terminal.dispose();
        return;
    }
    terminal.sendText(prefix);

    const author = await vscode.window.showInputBox({
        placeHolder: "Author (Me)"
    });
    if (typeof author === "undefined") {
        terminal.dispose();
        return;
    }
    terminal.sendText(author);

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Downloading script_macros_common.hpp",
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
