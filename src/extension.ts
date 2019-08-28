import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";
import {
    HemttScriptHoverProvider,
    invalidateHoverScriptsCache
} from "./scriptHover";
import { HemttScriptsTreeDataProvider } from "./views/hemtt/HemttScriptsTreeDataProvider";
import { HemttTaskProvider, invalidateTasksCache, hasHemttJson } from "./tasks";

let treeDataProvider: HemttScriptsTreeDataProvider | undefined;

export async function activate(context: vscode.ExtensionContext) {
    registerTaskProvider(context);
    treeDataProvider = registerExplorer(context);
    registerHoverProvider(context);
    let d = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("hemtt.exclude")) {
            invalidateTasksCache();
            if (treeDataProvider) {
                treeDataProvider.refresh();
            }
        }
        if (e.affectsConfiguration("hemtt.scriptExplorerAction")) {
            if (treeDataProvider) {
                treeDataProvider.refresh();
            }
        }
    });
    context.subscriptions.push(d);
    d = vscode.workspace.onDidChangeTextDocument(e => {
        invalidateHoverScriptsCache(e.document);
    });
    context.subscriptions.push(d);
    registerCommands(context);

    if (await hasHemttJson()) {
        vscode.commands.executeCommand(
            "setContext",
            "hemtt:showScriptExplorer",
            true
        );
    }
}

function registerTaskProvider(
    context: vscode.ExtensionContext
): vscode.Disposable | undefined {
    function invalidateScriptCaches() {
        invalidateHoverScriptsCache();
        invalidateTasksCache();
        if (treeDataProvider) {
            treeDataProvider.refresh();
        }
    }

    if (vscode.workspace.workspaceFolders) {
        const watcher = vscode.workspace.createFileSystemWatcher(
            "**/hemtt.json"
        );
        watcher.onDidChange(_e => invalidateScriptCaches());
        watcher.onDidDelete(_e => invalidateScriptCaches());
        watcher.onDidCreate(_e => invalidateScriptCaches());
        context.subscriptions.push(watcher);

        const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(
            _e => invalidateScriptCaches()
        );
        context.subscriptions.push(workspaceWatcher);

        const provider: vscode.TaskProvider = new HemttTaskProvider();
        const disposable = vscode.workspace.registerTaskProvider(
            "hemtt",
            provider
        );
        context.subscriptions.push(disposable);
        return disposable;
    }
    return undefined;
}

function registerExplorer(
    context: vscode.ExtensionContext
): HemttScriptsTreeDataProvider | undefined {
    if (vscode.workspace.workspaceFolders) {
        const treeDataProvider = new HemttScriptsTreeDataProvider(context);
        const view = vscode.window.createTreeView("hemtt", {
            treeDataProvider,
            showCollapseAll: true
        });
        context.subscriptions.push(view);
        return treeDataProvider;
    }
    return undefined;
}

function registerHoverProvider(
    context: vscode.ExtensionContext
): HemttScriptHoverProvider | undefined {
    if (vscode.workspace.workspaceFolders) {
        const npmSelector: vscode.DocumentSelector = {
            language: "json",
            scheme: "file",
            pattern: "**/hemtt.json"
        };
        const provider = new HemttScriptHoverProvider(context);
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(npmSelector, provider)
        );
        return provider;
    }
    return undefined;
}

export function deactivate() {}
