import { IStringMap } from "./jsonVisitors";
import { HemttScript } from "./HemttScript";
import { TextDocument } from "vscode";

export async function findAllTomlScripts(_buffer: string): Promise<IStringMap> {
  return {};
}

export function findAllTomlScriptsRanges(
  _buffer: string
): Map<string, [number, number, string]> {
  const scripts: Map<string, [number, number, string]> = new Map();
  return scripts;
}

export function findTomlScriptAtPosition(
  _buffer: string,
  _offset: number
): string | undefined {
  return undefined;
}

export function findTomlScripts(
  _document: TextDocument,
  _script?: HemttScript
): number {
  return 0;
}
