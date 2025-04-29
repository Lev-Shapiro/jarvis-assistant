import { BrowserActionPayload } from "@/domain/action/payload/request/browser-action";
import { WebsiteActionPayload } from "@/domain/action/payload/request/website-action";
import { Action } from "@/domain/action/regular/action";
import { ActionResponse } from "@/domain/action/regular/action-response";
import {
  ActionType,
  BrowserActionType,
  WebsiteActionType,
} from "@/domain/action/regular/action-type";
import { MessageResponse } from "@/domain/message/message";
import { BrowserConnectionService } from "../browser-connection.service";

export class ActionExecutor {
  constructor(
    private readonly browserConnectionService: BrowserConnectionService
  ) {}

  public async openNewTab(
    payload: BrowserActionPayload<BrowserActionType.OPEN_NEW_TAB>
  ) {
    return await this.executeMany([
      {
        type: BrowserActionType.OPEN_NEW_TAB,
        payload: { url: payload.url },
      },
    ]);
  }

  public async closeTab() {
    return await this.executeMany([
      {
        type: BrowserActionType.CLOSE_TAB,
        payload: {},
      },
    ]);
  }

  public async navigateTo(
    payload: BrowserActionPayload<BrowserActionType.NAVIGATE_TO>
  ) {
    return await this.executeMany([
      {
        type: BrowserActionType.NAVIGATE_TO,
        payload,
      },
    ]);
  }

  public async clickElement(
    payload: WebsiteActionPayload<WebsiteActionType.CLICK_ELEMENT>
  ) {
    return await this.executeMany([
      {
        type: WebsiteActionType.CLICK_ELEMENT,
        payload,
      },
    ]);
  }

  public async typeText(
    payload: WebsiteActionPayload<WebsiteActionType.TYPE_TEXT>
  ) {
    return await this.executeMany([
      {
        type: WebsiteActionType.TYPE_TEXT,
        payload,
      },
    ]);
  }

  public async screenshot() {
    return await this.executeMany([
      {
        type: BrowserActionType.SCREENSHOT,
        payload: {},
      },
    ]);
  }

  public async getInnerText(
    payload: WebsiteActionPayload<WebsiteActionType.GET_INNER_TEXT>
  ) {
    return await this.executeMany([
      Action.create(WebsiteActionType.GET_INNER_TEXT, payload),
    ]);
  }

  public async scrollPage(
    payload: WebsiteActionPayload<WebsiteActionType.SCROLL_PAGE>
  ) {
    return await this.executeMany([
      {
        type: WebsiteActionType.SCROLL_PAGE,
        payload,
      },
    ]);
  }

  public async keyPress(
    payload: WebsiteActionPayload<WebsiteActionType.KEY_PRESS>
  ) {
    return await this.executeMany([
      {
        type: WebsiteActionType.KEY_PRESS,
        payload,
      },
    ]);
  }

  public async getFullPageHtml() {
    return await this.executeMany([
      { type: WebsiteActionType.GET_FULL_PAGE_HTML, payload: {} },
    ]);
  }

  public async executeMany<T extends ActionType>(
    actions: Action<T>[]
  ): Promise<MessageResponse<T, true, ActionResponse<T>[]>> {
    const results = await this.browserConnectionService.sendMessage({
      actions,
    });

    return results;
  }
}
