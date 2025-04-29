import { WebsiteActionType } from "../../regular/action-type";

export class ClickElement_WebsiteRequestPayload {
  constructor(public selector: string) {}
}

export class TypeText_WebsiteRequestPayload {
  constructor(public selector: string, public text: string) {}
}

export class GetInnerText_WebsiteRequestPayload {
  constructor(public selector: string) {}
}

export class ScrollPage_WebsiteRequestPayload {
  constructor(public direction: 'up' | 'down' | 'top' | 'bottom', public amount?: number) {}
}

export class KeyPress_WebsiteRequestPayload {
  constructor(public key: string, public modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean }, public selector?: string) {}
}

export class GetFullPageHTML_WebsiteRequestPayload {
  constructor() {}
}

export type WebsiteActionPayload<T extends WebsiteActionType> = 
  T extends WebsiteActionType.CLICK_ELEMENT ? ClickElement_WebsiteRequestPayload :
  T extends WebsiteActionType.TYPE_TEXT ? TypeText_WebsiteRequestPayload :
  T extends WebsiteActionType.GET_INNER_TEXT ? GetInnerText_WebsiteRequestPayload :
  T extends WebsiteActionType.SCROLL_PAGE ? ScrollPage_WebsiteRequestPayload :
  T extends WebsiteActionType.KEY_PRESS ? KeyPress_WebsiteRequestPayload :
  T extends WebsiteActionType.GET_FULL_PAGE_HTML ? GetFullPageHTML_WebsiteRequestPayload :
  never;