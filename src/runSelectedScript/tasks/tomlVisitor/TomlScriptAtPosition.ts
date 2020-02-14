import {
  BaseTomlCstVisitorWithDefaults,
  KeyCtx,
  StdTableCtx
} from "@toml-tools/parser";

// There is strange error when using type
export class TomlScriptAtPosition extends BaseTomlCstVisitorWithDefaults {
  public script: string | undefined;

  constructor(private offset: number) {
    super();
    this.script = "";
  }

  public stdTable(ctx: StdTableCtx) {
    this.script = this.visit(ctx.key);
  }

  public key(ctx: KeyCtx): string | undefined {
    const keyImages: Array<string | undefined> = ctx.IKey.map((keyTok: any) => {
      if (keyTok.startOffset !== this.offset) {
        return undefined;
      }

      return keyTok.image;
    });
    return keyImages[1];
  }
}
