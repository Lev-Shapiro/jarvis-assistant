export enum BrowserActionType {
  OPEN_NEW_TAB = 'openNewTab',
  CLOSE_TAB = 'closeTab',
  NAVIGATE_TO = 'navigateTo',
  SCREENSHOT = 'screenshot'
}

export enum WebsiteActionType {
  CLICK_ELEMENT = 'clickElement',
  TYPE_TEXT = 'typeText',
  GET_INNER_TEXT = 'getInnerText',
  SCROLL_PAGE = 'scrollPage',
  KEY_PRESS = 'keyPress',
  GET_FULL_PAGE_HTML = 'getFullPageHTML'
}

export type ActionType = BrowserActionType | WebsiteActionType;