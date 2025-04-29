import { AnyAbstractAction } from "@/domain/action/abstract/abstract-action";
import { Action } from "@/domain/action/regular/action";
import { ActionType, BrowserActionType, WebsiteActionType } from "@/domain/action/regular/action-type";
import { ActionExecutor } from "../executor";

export class ActionBuilderService {
  constructor(private readonly actionExecutor: ActionExecutor) {}

  async execute(actions: AnyAbstractAction[]): Promise<Action<ActionType>[]> {
    const browserActions: Action<ActionType>[] = [];

    for (const action of actions) {
      const generatedActions = await this.build(action);
      browserActions.push(...generatedActions);
    }

    return browserActions;
  }

  async build<T extends ActionType>(data: AnyAbstractAction): Promise<Action<T>[]> {
    const actions: Action<T>[] = [];

    return actions;
  }

  private async start(website: string) {
    return await this.actionExecutor.executeMany<
      | BrowserActionType.NAVIGATE_TO
      | BrowserActionType.SCREENSHOT
      | WebsiteActionType.GET_FULL_PAGE_HTML
    >([
      Action.create(BrowserActionType.NAVIGATE_TO, { url: website }),
      Action.create(BrowserActionType.SCREENSHOT, {}),
      Action.create(WebsiteActionType.GET_FULL_PAGE_HTML, {}),
    ]);
  }
}
