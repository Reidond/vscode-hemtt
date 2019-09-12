import { commands, ExtensionContext } from "vscode";
import { create } from "./project/create";
import { init } from "./project/init";
import { createAddon } from "./project/createAddon";
import { createFunctionOnPick } from "./project/createFunctionOnPick";
import { createFunctionOnContext } from "./project/createFunctionOnContext";

export function registerCommands(context: ExtensionContext): void {
    context.subscriptions.push(
        commands.registerCommand("hemtt.project.create", create)
    );
    context.subscriptions.push(
        commands.registerCommand("hemtt.project.init", init)
    );
    context.subscriptions.push(
        commands.registerCommand("hemtt.project.createAddon", createAddon)
    );
    context.subscriptions.push(
        commands.registerCommand(
            "hemtt.project.createFunctionOnPick",
            createFunctionOnPick
        )
    );
    context.subscriptions.push(
        commands.registerCommand(
            "hemtt.project.createFunctionOnContext",
            createFunctionOnContext
        )
    );
}
