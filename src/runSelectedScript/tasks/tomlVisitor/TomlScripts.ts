import {
  BaseTomlCstVisitorWithDefaults,
  KeyCtx,
  StdTableCtx
} from "@toml-tools/parser";
import { IStringMap } from "..\jsonVisitor";
import { HemttScript } from "..\jsonVisitor\HemttScript";
import { getTaskName } from "..\..\tasks";

// There is strange error when using type
export class TomlScripts extends BaseTomlCstVisitorWithDefaults {
  public tableKeyNames: IStringMap;
  public offset: number;

  constructor(public script?: HemttScript) {
    super();
    this.tableKeyNames = {};
    this.offset = 0;
  }

  public stdTable(ctx: StdTableCtx) {
    const data = this.visit(ctx.key);
    this.tableKeyNames[data[0]] = "";
    this.offset = data[1];
  }

  public key(ctx: KeyCtx) {
    const keyImages = ctx.IKey.map((value: any) => value.image);
    const findOneOffset = ctx.IKey.map((value: any) => {
      if (this.script) {
        const label = getTaskName(
          value.image,
          this.script.task.definition.path
        );
        if (this.script.task.name === label) {
          return value.startOffset;
        }
      }

      return value.startOffset;
    });
    return [keyImages[1], findOneOffset[0]];
  }
}
