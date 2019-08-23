import { commands, ExtensionContext } from "vscode";
import { create } from "./project/create";
import { init } from "./project/init";

export function registerCommands(context: ExtensionContext): void {
  context.subscriptions.push(
    commands.registerCommand("hemtt.project.create", create)
  );
  context.subscriptions.push(
    commands.registerCommand("hemtt.project.init", init)
  );
}
