import { IStringMap } from "./jsonVisitors";

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
