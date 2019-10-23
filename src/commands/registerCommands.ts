import { commands, ExtensionContext } from "vscode";
import { create } from "./project/create";
import { init } from "./project/init";
import { createAddon } from "./project/template/createAddon";
import { createFunctionOnPalette } from "./project/template/createFunctionOnPalette";
import { createFunctionOnContext } from "./project/template/createFunctionOnContext";
import { deleteFunctionOnPalette } from "./project/template/deleteFunctionOnPalette";
import { deleteFunctionOnContext } from "./project/template/deleteFunctionOnContext";
import { moveFunctionOnPalette } from "./project/template/moveFunctionOnPalette";
import { moveFunctionOnContext } from "./project/template/moveFunctionOnContext";
import { buildOnPalette } from "./project/build/buildOnPalette";
import { buildReleaseOnPalette } from "./project/build/buildReleaseOnPalette";

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
