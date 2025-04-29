import { BrowserActionType } from "../../regular/action-type";

export class OpenNewTab_BrowserResponsePayload {
  constructor() {}
}

export class NavigateTo_BrowserResponsePayload {
  constructor() {}
}

export class CloseTab_BrowserResponsePayload {
  constructor() {}
}

export class Screenshot_BrowserResponsePayload {
  screenshotPath: string;
  
  constructor(screenshotPath: string) {
    this.screenshotPath = screenshotPath;
  }
}

export type BrowserActionResponsePayload<T extends BrowserActionType> = 
  T extends BrowserActionType.OPEN_NEW_TAB ? OpenNewTab_BrowserResponsePayload :
  T extends BrowserActionType.NAVIGATE_TO ? NavigateTo_BrowserResponsePayload :
  T extends BrowserActionType.CLOSE_TAB ? CloseTab_BrowserResponsePayload :
  T extends BrowserActionType.SCREENSHOT ? Screenshot_BrowserResponsePayload :
  never;