import { WebsiteActionType } from "../../regular/action-type";

export class ClickElement_WebsiteResponsePayload {}
export class TypeText_WebsiteResponsePayload {}
export class ScrollPage_WebsiteResponsePayload {}
export class KeyPress_WebsiteResponsePayload {}

export class GetInnerText_WebsiteResponsePayload {
  constructor(public innerText: string) {}
}

export class GetFullPageHTML_WebsiteResponsePayload {
  constructor(public htmlPath: string) {}
}

export type WebsiteActionResponsePayload<T extends WebsiteActionType> =
  T extends WebsiteActionType.CLICK_ELEMENT
    ? ClickElement_WebsiteResponsePayload
    : T extends WebsiteActionType.TYPE_TEXT
    ? TypeText_WebsiteResponsePayload
    : T extends WebsiteActionType.GET_INNER_TEXT
    ? GetInnerText_WebsiteResponsePayload
    : T extends WebsiteActionType.SCROLL_PAGE
    ? ScrollPage_WebsiteResponsePayload
    : T extends WebsiteActionType.KEY_PRESS
    ? KeyPress_WebsiteResponsePayload
    : T extends WebsiteActionType.GET_FULL_PAGE_HTML
    ? GetFullPageHTML_WebsiteResponsePayload
    : never;
