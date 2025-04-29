import { AbstractActionPayload } from "../payload/abstract/abstract-action.payload";
import { AbstractActionType } from "./abstract-action-type";

export class AbstractAction<T extends AbstractActionType> {
  private constructor(
    public readonly type: T,
    public readonly payload: AbstractActionPayload<T>,
    public readonly query: string
  ) {}

  public static create<T extends AbstractActionType>(type: T, payload: AbstractActionPayload<T>, query: string): AbstractAction<T> {
    return new AbstractAction(type, payload, query);
  }
}

export type AnyAbstractAction = AbstractAction<AbstractActionType>;