import { AbstractActionType } from "../abstract/abstract-action-type";
import { BrowserActionType } from "../regular/action-type";

import { WebsiteActionType } from "../regular/action-type";

import { ActionType } from "../regular/action-type";
import {
  GetListOfElementsActionPayload,
  LoopActionsActionPayload,
  LoopElementsInListActionPayload,
  RetrieveActionPayload,
  ScrollYActionPayload,
  SearchActionPayload,
  SendStreamResultActionPayload,
} from "./abstract/abstract-action.payload";
import { BrowserActionPayload } from "./request/browser-action";
import { WebsiteActionPayload } from "./request/website-action";
import { BrowserActionResponsePayload } from "./response/browser-action";
import { WebsiteActionResponsePayload } from "./response/website-action";

export type ActionPayload<T extends ActionType> = T extends BrowserActionType
  ? BrowserActionPayload<T>
  : T extends WebsiteActionType
  ? WebsiteActionPayload<T>
  : never;

export type ActionResponsePayload<T extends ActionType> =
  T extends BrowserActionType
    ? BrowserActionResponsePayload<T>
    : T extends WebsiteActionType
    ? WebsiteActionResponsePayload<T>
    : never;