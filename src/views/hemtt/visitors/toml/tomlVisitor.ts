import { IStringMap } from "../json/jsonVisitor";
import { HemttScript } from "../../HemttScript";
import { TomlScripts } from "./TomlScripts";
import { TomlScriptsRanges } from "./AllTomlScriptsRanges";
import { TextDocument } from "vscode";
import { parse } from "@toml-tools/parser";
import { TomlScriptAtPosition } from "./TomlScriptAtPosition";

export async function findAllTomlScripts(buffer: string): Promise<IStringMap> {
  const tomlCst = parse(buffer);
  const myVisitor = new TomlScripts();
  myVisitor.visit(tomlCst);

  return myVisitor.tableKeyNames;
}

export function findAllTomlScriptsRanges(
  buffer: string
): Map<string, [number, number, string]> {
  const tomlCst = parse(buffer);
  const myVisitor = new TomlScriptsRanges();
  myVisitor.visit(tomlCst);

  return myVisitor.scripts;
}

export function findTomlScriptAtPosition(
  buffer: string,
  offset: number
): string | undefined {
  const tomlCst = parse(buffer);
  const myVisitor = new TomlScriptAtPosition(offset);
  myVisitor.visit(tomlCst);

  return myVisitor.script;
}

export function findTomlScripts(
  document: TextDocument,
  script?: HemttScript
): number {
  const tomlCst = parse(document.getText());
  const myVisitor = new TomlScripts(script);
  myVisitor.visit(tomlCst);

  return myVisitor.offset;
}
