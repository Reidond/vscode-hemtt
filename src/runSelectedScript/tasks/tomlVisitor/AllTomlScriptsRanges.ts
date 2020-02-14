import {
  BaseTomlCstVisitorWithDefaults,
  KeyCtx,
  StdTableCtx
} from "@toml-tools/parser";

// There is strange error when using type
export class TomlScriptsRanges extends BaseTomlCstVisitorWithDefaults {
  public scripts: Map<string, [number, number, string]>;

  constructor() {
    super();
    this.scripts = new Map();
  }

  public stdTable(ctx: StdTableCtx) {
    const data: [string, [number, number, string]] = this.visit(ctx.key);
    this.scripts.set(data[0], data[1]);
  }

  public key(ctx: KeyCtx): [string, [number, number, string]] {
    const keyImages = ctx.IKey.map((keyTok: any) => keyTok.image);
    const keyStartOffset = ctx.IKey.map((keyTok: any) => keyTok.startOffset);
    const keyLength = ctx.IKey.map((keyTok: any) => {
      if (keyTok.endOffset) {
        return keyTok.endOffset - keyTok.startOffset;
      }

      return keyTok.startOffset;
    });
    return [keyImages[1], [keyStartOffset[0], keyLength[0], ""]];
  }
}
