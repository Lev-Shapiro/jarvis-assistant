import { BrowserActionType } from "../../regular/action-type";

export class OpenNewTab_BrowserRequestPayload {
  constructor(public url: string) {}
}

export class NavigateTo_BrowserRequestPayload {
  constructor(public url: string) {}
}

export class CloseTab_BrowserRequestPayload {
  constructor() {}
}

export class Screenshot_BrowserRequestPayload {
  constructor() {}
}

export type BrowserActionPayload<T extends BrowserActionType> = 
  T extends BrowserActionType.OPEN_NEW_TAB ? OpenNewTab_BrowserRequestPayload :
  T extends BrowserActionType.NAVIGATE_TO ? NavigateTo_BrowserRequestPayload :
  T extends BrowserActionType.CLOSE_TAB ? CloseTab_BrowserRequestPayload :
  T extends BrowserActionType.SCREENSHOT ? Screenshot_BrowserRequestPayload :
  never;