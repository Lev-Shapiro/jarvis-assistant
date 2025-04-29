import { ActionPayload } from "../payload/payload";
import { ActionType } from "./action-type";

export class Action<T extends ActionType> {
  type: T;
  payload: ActionPayload<T>;

  private constructor(type: T, payload: ActionPayload<T>) {
    this.type = type;
    this.payload = payload;
  }

  public static create<T extends ActionType>(type: T, payload: ActionPayload<T>): Action<T> {
    return new Action(type, payload);
  }
}

// Create the discriminated union type for all possible actions
export type AnyAction = {
  [T in ActionType]: Action<T>;
}[ActionType];