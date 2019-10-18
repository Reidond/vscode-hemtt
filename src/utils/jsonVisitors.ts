import { JSONVisitor, ParseErrorCode, visit } from "jsonc-parser";
import { window } from "vscode";

export interface IStringMap {
  [s: string]: string;
}

export function defaultProps(property: string) {
  return (
    property === "steps" ||
    property === "steps_windows" ||
    property === "steps_linux" ||
    property === "show_output" ||
    property === "parallel" ||
    property === "foreach"
  );
}

export async function findAllJsonScripts(buffer: string): Promise<IStringMap> {
  const scripts: IStringMap = {};
  let script: string | undefined;
  let inScripts = false;

  const visitor: JSONVisitor = {
    onError(_error: ParseErrorCode, _offset: number, _length: number) {
      window.showErrorMessage(
        `Got ${_error} at ${_offset}. Line length is ${_length}`
      );
    },
    onLiteralValue(_value: any, _offset: number, _length: number) {
      if (script) {
        scripts[script] = "";
        script = undefined;
      }
    },
    onObjectProperty(property: string, _offset: number, _length: number) {
      if (property === "scripts") {
        inScripts = true;
      } else if (inScripts && !script) {
        if (!defaultProps(property)) {
          script = property;
        }
      }
    }
  };

  visit(buffer, visitor);

  return scripts;
}

export function findAllJsonScriptRanges(
  buffer: string
): Map<string, [number, number, string]> {
  const scripts: Map<string, [number, number, string]> = new Map();
  let script: string | undefined;
  let offset: number;
  let length: number;

  let inScripts = false;

  const visitor: JSONVisitor = {
    onError(_error: ParseErrorCode, _offset: number, _length: number) {
      window.showErrorMessage(
        `Got ${_error} at ${_offset}. Line length is ${_length}`
      );
    },
    onLiteralValue(_value: any, _offset: number, _length: number) {
      if (script) {
        scripts.set(script, [offset, length, ""]);
        script = undefined;
      }
    },
    onObjectProperty(property: string, off: number, len: number) {
      if (property === "scripts") {
        inScripts = true;
      } else if (inScripts) {
        if (!defaultProps(property)) {
          script = property;
          offset = off;
          length = len;
        }
      }
    }
  };

  visit(buffer, visitor);

  return scripts;
}

export function findJsonScriptAtPosition(
  buffer: string,
  offset: number
): string | undefined {
  let script: string | undefined;
  let foundScript: string | undefined;
  let inScripts = false;
  let scriptStart: number | undefined;
  const visitor: JSONVisitor = {
    onError(error: ParseErrorCode, offset: number, length: number) {
      window.showErrorMessage(
        `Got ${error} at ${offset}. Line length is ${length}`
      );
    },
    onObjectEnd() {
      if (inScripts) {
        inScripts = false;
        scriptStart = undefined;
      }
    },
    onLiteralValue(value: any, nodeOffset: number, nodeLength: number) {
      if (inScripts && scriptStart) {
        if (
          typeof value === "string" &&
          offset >= scriptStart &&
          offset < nodeOffset + nodeLength
        ) {
          // found the script
          inScripts = false;
          foundScript = script;
        } else {
          script = undefined;
        }
      }
    },
    onObjectProperty(property: string, nodeOffset: number) {
      if (property === "scripts") {
        inScripts = true;
      } else if (inScripts) {
        if (!defaultProps(property)) {
          scriptStart = nodeOffset;
          script = property;
        }
      }
    }
  };

  visit(buffer, visitor);

  return foundScript;
}
