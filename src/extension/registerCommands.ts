import { commands, ExtensionContext } from "vscode";
import { create } from "./registerCommands\create";
import { init } from "./registerCommands\init";
import { createAddon } from "./registerCommands\createAddon";
import { createFunctionOnPalette } from "./registerCommands\createFunctionOnPalette";
import { createFunctionOnContext } from "./registerCommands\createFunctionOnContext";
import { deleteFunctionOnPalette } from "./registerCommands\deleteFunctionOnPalette";
import { deleteFunctionOnContext } from "./registerCommands\deleteFunctionOnContext";
import { moveFunctionOnPalette } from "./registerCommands\moveFunctionOnPalette";
import { moveFunctionOnContext } from "./registerCommands\moveFunctionOnContext";
import { buildOnPalette } from "./registerCommands\buildOnPalette";
import { buildReleaseOnPalette } from "./registerCommands\buildReleaseOnPalette";

export function registerCommands(context: ExtensionContext): void {
  context.subscriptions.push(
    commands.registerCommand("hemtt.project.create", create)
  );
  context.subscriptions.push(
    commands.registerCommand("hemtt.project.init", init)
  );
  context.subscriptions.push(
    commands.registerCommand("hemtt.project.template.createAddon", createAddon)
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.template.createFunctionOnPalette",
      createFunctionOnPalette
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.template.createFunctionOnContext",
      createFunctionOnContext
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.template.deleteFunctionOnPalette",
      deleteFunctionOnPalette
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.template.deleteFunctionOnContext",
      deleteFunctionOnContext
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.template.moveFunctionOnPalette",
      moveFunctionOnPalette
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.template.moveFunctionOnContext",
      moveFunctionOnContext
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.build.buildOnPalette",
      buildOnPalette
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "hemtt.project.build.buildReleaseOnPalette",
      buildReleaseOnPalette
    )
  );
}
