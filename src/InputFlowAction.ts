import { QuickInputButton, QuickPickItem } from "vscode";

export class InputFlowAction {
  public static back = new InputFlowAction();
  public static cancel = new InputFlowAction();
  public static resume = new InputFlowAction();
  private constructor() {}
}

export interface IQuickPickParameters<T extends QuickPickItem> {
  title: string;
  step: number;
  totalSteps: number;
  items: T[];
  activeItem?: T;
  placeholder: string;
  buttons?: QuickInputButton[];
  shouldResume: () => Thenable<boolean>;
}

export interface IInputBoxParameters {
  title: string;
  step: number;
  totalSteps: number;
  value: string;
  prompt: string;
  validate: (value: string) => Promise<string | undefined>;
  buttons?: QuickInputButton[];
  shouldResume: () => Thenable<boolean>;
}
