/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
    ExtensionContext,
    TextDocument,
    commands,
    ProviderResult,
    CancellationToken,
    workspace,
    tasks,
    Range,
    HoverProvider,
    Hover,
    Position,
    MarkdownString,
    Uri
} from "vscode";
import { createTask, findAllScriptRanges } from "./tasks";

let cachedDocument: Uri | undefined;
let cachedScriptsMap: Map<string, [number, number, string]> | undefined;

export function invalidateHoverScriptsCache(document?: TextDocument) {
    if (!document) {
        cachedDocument = undefined;
        return;
    }
    if (document.uri === cachedDocument) {
        cachedDocument = undefined;
    }
}

export class HemttScriptHoverProvider implements HoverProvider {
    constructor(context: ExtensionContext) {
        context.subscriptions.push(
            commands.registerCommand(
                "hemtt.view.runScriptFromHover",
                this.runScriptFromHover,
                this
            )
        );
    }

    public provideHover(
        document: TextDocument,
        position: Position,
        _token: CancellationToken
    ): ProviderResult<Hover> {
        let hover: Hover | undefined;

        if (!cachedDocument || cachedDocument.fsPath !== document.uri.fsPath) {
            cachedScriptsMap = findAllScriptRanges(document.getText());
            cachedDocument = document.uri;
        }

        cachedScriptsMap!.forEach((value, key) => {
            const start = document.positionAt(value[0]);
            const end = document.positionAt(value[0] + value[1]);
            const range = new Range(start, end);

            if (range.contains(position)) {
                const contents: MarkdownString = new MarkdownString();
                contents.isTrusted = true;
                contents.appendMarkdown(
                    this.createRunScriptMarkdown(key, document.uri)
                );
                hover = new Hover(contents);
            }
        });
        return hover;
    }

    public runScriptFromHover(args: any) {
        const script = args.script;
        const documentUri = args.documentUri;
        const folder = workspace.getWorkspaceFolder(documentUri);
        if (folder) {
            const task = createTask(
                script,
                `run ${script}`,
                folder,
                documentUri
            );
            tasks.executeTask(task);
        }
    }

    private createRunScriptMarkdown(script: string, documentUri: Uri): string {
        const args = {
            documentUri,
            script
        };
        return this.createMarkdownLink(
            "Run Script",
            "hemtt.view.runScriptFromHover",
            args,
            "Run the script as a task"
        );
    }

    private createMarkdownLink(
        label: string,
        cmd: string,
        args: any,
        tooltip: string,
        separator?: string
    ): string {
        const encodedArgs = encodeURIComponent(JSON.stringify(args));
        let prefix = "";
        if (separator) {
            prefix = ` ${separator} `;
        }
        return `${prefix}[${label}](command:${cmd}?${encodedArgs} "${tooltip}")`;
    }
}
