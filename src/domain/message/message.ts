import { Action } from "../action/regular/action";
import { ActionResponse } from "../action/regular/action-response";
import { ActionType } from "../action/regular/action-type";

export class MessageRequest<T extends ActionType> {
  actions: Action<T>[];

  constructor(actions: Action<T>[]) {
    this.actions = actions;
  }
}

export class MessageResponse<
  T extends ActionType,
  S extends boolean,
  A extends (S extends true ? ActionResponse<T>[] : undefined)
> {
  success: S;
  actions: A;
  message?: string;

  private constructor(success: S, actions: A, message?: string) {
    this.success = success;
    this.actions = actions;
    this.message = message;
  }

  public static success<T extends ActionType, A extends ActionResponse<T>[]>(actions: A, message?: string): MessageResponse<T, true, A> {
    return new MessageResponse(true, actions, message);
  }

  public static error<T extends ActionType>(message?: string): MessageResponse<T, false, undefined> {
    return new MessageResponse(false, undefined, message);
  }
}
