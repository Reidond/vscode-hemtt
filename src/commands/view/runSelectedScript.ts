/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import { runScript, findScriptAtPosition } from "../../tasks";

export function runSelectedScript() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const document = editor.document;
    const contents = document.getText();
    const selection = editor.selection;
    const offset = document.offsetAt(selection.anchor);

    const script = findScriptAtPosition(contents, offset);
    if (script) {
        runScript(script, document);
    } else {
        const message = "Could not find a valid npm script at the selection.";
        vscode.window.showErrorMessage(message);
    }
}
