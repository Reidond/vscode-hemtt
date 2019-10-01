import { commands, ExtensionContext } from "vscode";
import { create } from "./project/create";
import { init } from "./project/init";
import { createAddon } from "./project/createAddon";
import { createFunctionOnPalette } from "./project/createFunctionOnPalette";
import { createFunctionOnContext } from "./project/createFunctionOnContext";
import { deleteFunctionOnPalette } from "./project/deleteFunctionOnPalette";
import { deleteFunctionOnContext } from "./project/deleteFunctionOnContext";
import { moveFunctionOnPalette } from "./project/moveFunctionOnPalette";
import { moveFunctionOnContext } from "./project/moveFunctionOnContext";

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
      "hemtt.project.createFunctionOnPalette",
      createFunctionOnPalette
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.createFunctionOnContext",
      createFunctionOnContext
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.deleteFunctionOnPalette",
      deleteFunctionOnPalette
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.deleteFunctionOnContext",
      deleteFunctionOnContext
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.moveFunctionOnPalette",
      moveFunctionOnPalette
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.moveFunctionOnContext",
      moveFunctionOnContext
    )
  );
}
