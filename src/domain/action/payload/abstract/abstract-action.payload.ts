import { AnyAbstractAction } from "../../abstract/abstract-action";
import { AbstractActionType } from "../../abstract/abstract-action-type";

export class SearchActionPayload {
  constructor(
    public readonly query: string
  ) {}
}

export class GetListOfElementsActionPayload {
  constructor(
    public readonly id: string,
    public readonly query: string
  ) {}
}

export class RetrieveActionPayload {
  constructor(
    public readonly elementId: string,
    public readonly query: string,
    public readonly saveAs: string,
    public readonly isOptional: boolean,
    public readonly defaultValue: string
  ) {}
}

export class SendStreamResultActionPayload {
  constructor(
    public readonly data: Record<string, string>
  ) {}
}

export class ScrollYActionPayload {
  constructor(
    public readonly value: number
  ) {}
}

export class LoopElementsInListActionPayload {
  constructor(
    public readonly listId: string,
    public readonly elementId: string,
    public readonly subActions: AnyAbstractAction[]
  ) {}
}

export class LoopActionsActionPayload {
  constructor(
    public readonly conditionPrompt: string,
    public readonly subActions: AnyAbstractAction[]
  ) {}
}

export type AbstractActionPayload<T extends AbstractActionType> =
  T extends AbstractActionType.SEARCH
    ? SearchActionPayload
    : T extends AbstractActionType.GET_LIST_OF_ELEMENTS
    ? GetListOfElementsActionPayload
    : T extends AbstractActionType.RETRIEVE
    ? RetrieveActionPayload
    : T extends AbstractActionType.SEND_STREAM_RESULT
    ? SendStreamResultActionPayload
    : T extends AbstractActionType.SCROLL_Y
    ? ScrollYActionPayload
    : T extends AbstractActionType.LOOP_ELEMENTS_IN_LIST
    ? LoopElementsInListActionPayload
    : T extends AbstractActionType.LOOP_ACTIONS
    ? LoopActionsActionPayload
    : never;