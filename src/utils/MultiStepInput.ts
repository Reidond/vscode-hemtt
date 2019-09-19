import {
    Disposable,
    QuickInput,
    QuickInputButtons,
    QuickPickItem,
    window
} from "vscode";
import {
    IQuickPickParameters,
    IInputBoxParameters,
    InputFlowAction,
    IFilteredQuickPickParameters
} from "./InputFlowAction";

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

export class MultiStepInput {
    public static async run(start: InputStep) {
        const input = new MultiStepInput();
        return input.stepThrough(start);
    }

    private current?: QuickInput;
    private steps: InputStep[] = [];

    public async showQuickPick<
        T extends QuickPickItem,
        P extends IQuickPickParameters<T>
    >({
        title,
        step,
        totalSteps,
        items,
        activeItem,
        placeholder,
        buttons,
        shouldResume
    }: P) {
        const disposables: Disposable[] = [];
        try {
            return await new Promise<
                T | (P extends { buttons: Array<infer I> } ? I : never)
            >((resolve, reject) => {
                const cqp = window.createQuickPick<T>();
                cqp.title = title;
                cqp.step = step;
                cqp.totalSteps = totalSteps;
                cqp.placeholder = placeholder;
                cqp.items = items;
                if (activeItem) {
                    cqp.activeItems = [activeItem];
                }
                cqp.buttons = [
                    ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                disposables.push(
                    cqp.onDidTriggerButton(item => {
                        if (item === QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        } else {
                            resolve(item as any);
                        }
                    }),
                    cqp.onDidChangeSelection(selectionItems =>
                        resolve(selectionItems[0])
                    ),
                    cqp.onDidHide(() => {
                        (async () => {
                            reject(
                                shouldResume && (await shouldResume())
                                    ? InputFlowAction.resume
                                    : InputFlowAction.cancel
                            );
                        })().catch(reject);
                    })
                );
                if (this.current) {
                    this.current.dispose();
                }
                this.current = cqp;
                this.current.show();
            });
        } finally {
            disposables.forEach(d => d.dispose());
        }
    }

    public async showFilteredQuickPick<
        T extends QuickPickItem,
        P extends IFilteredQuickPickParameters<T>
    >({
        title,
        step,
        totalSteps,
        items,
        // filteredItems,
        activeItem,
        placeholder,
        buttons,
        shouldResume
    }: P) {
        const disposables: Disposable[] = [];
        try {
            return await new Promise<
                T | (P extends { buttons: Array<infer I> } ? I : never)
            >((resolve, reject) => {
                const cqp = window.createQuickPick<T>();
                cqp.title = title;
                cqp.step = step;
                cqp.totalSteps = totalSteps;
                cqp.placeholder = placeholder;
                cqp.items = items;
                cqp.ignoreFocusOut = true;
                if (activeItem) {
                    cqp.activeItems = [activeItem];
                }
                cqp.buttons = [
                    ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                const updateQuickPick = (value?: string): void => {
                    if (
                        typeof value !== "undefined" &&
                        value.charAt(0) === "@"
                    ) {
                        console.log(cqp.activeItems);
                    }
                };
                disposables.push(
                    cqp.onDidChangeValue(updateQuickPick),
                    cqp.onDidTriggerButton(item => {
                        if (item === QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        } else {
                            resolve(item as any);
                        }
                    }),
                    cqp.onDidChangeSelection(selectionItems =>
                        resolve(selectionItems[0])
                    ),
                    cqp.onDidHide(() => {
                        (async () => {
                            reject(
                                shouldResume && (await shouldResume())
                                    ? InputFlowAction.resume
                                    : InputFlowAction.cancel
                            );
                        })().catch(reject);
                    })
                );
                if (this.current) {
                    this.current.dispose();
                }
                this.current = cqp;
                this.current.show();
            });
        } finally {
            disposables.forEach(d => d.dispose());
        }
    }

    public async showInputBox<P extends IInputBoxParameters>({
        title,
        step,
        totalSteps,
        value,
        prompt,
        validate,
        buttons,
        shouldResume
    }: P) {
        const disposables: Disposable[] = [];
        try {
            return await new Promise<
                string | (P extends { buttons: Array<infer I> } ? I : never)
            >((resolve, reject) => {
                const cqp = window.createInputBox();
                cqp.title = title;
                cqp.step = step;
                cqp.totalSteps = totalSteps;
                cqp.value = value || "";
                cqp.prompt = prompt;
                cqp.buttons = [
                    ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                let validating = validate("");
                disposables.push(
                    cqp.onDidTriggerButton(item => {
                        if (item === QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        } else {
                            resolve(item as any);
                        }
                    }),
                    cqp.onDidAccept(async () => {
                        const inputValue = cqp.value;
                        cqp.enabled = false;
                        cqp.busy = true;
                        if (!(await validate(inputValue))) {
                            resolve(inputValue);
                        }
                        cqp.enabled = true;
                        cqp.busy = false;
                    }),
                    cqp.onDidChangeValue(async text => {
                        const current = validate(text);
                        validating = current;
                        const validationMessage = await current;
                        if (current === validating) {
                            cqp.validationMessage = validationMessage;
                        }
                    }),
                    cqp.onDidHide(() => {
                        (async () => {
                            reject(
                                shouldResume && (await shouldResume())
                                    ? InputFlowAction.resume
                                    : InputFlowAction.cancel
                            );
                        })().catch(reject);
                    })
                );
                if (this.current) {
                    this.current.dispose();
                }
                this.current = cqp;
                this.current.show();
            });
        } finally {
            disposables.forEach(d => d.dispose());
        }
    }

    private async stepThrough(start: InputStep) {
        let step: InputStep | void = start;
        while (step) {
            this.steps.push(step);
            if (this.current) {
                this.current.enabled = false;
                this.current.busy = true;
            }
            try {
                step = await step(this);
            } catch (err) {
                if (err === InputFlowAction.back) {
                    this.steps.pop();
                    step = this.steps.pop();
                } else if (err === InputFlowAction.resume) {
                    step = this.steps.pop();
                } else if (err === InputFlowAction.cancel) {
                    step = undefined;
                } else {
                    throw err;
                }
            }
        }
        if (this.current) {
            this.current.dispose();
        }
    }
}
