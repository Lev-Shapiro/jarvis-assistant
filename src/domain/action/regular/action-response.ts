import { ActionResponsePayload } from "../payload/payload";
import { ActionType } from "./action-type";

export class ActionResponse<
  T extends ActionType,
  S extends boolean = boolean,
  D = S extends true ? ActionResponsePayload<T> : undefined,
  M = string | undefined
> {
  type: T;
  success: S;
  data: D;
  message?: M;

  private constructor(type: T, success: S, data: D, message?: M) {
    this.type = type;
    this.success = success;
    this.data = data;
    this.message = message;
  }

  public static success<T extends ActionType, D extends ActionResponsePayload<T>>(type: T, data: D): ActionResponse<T, true, D> {
    return new ActionResponse(type, true, data);
  }

  public static error<T extends ActionType>(type: T, message: string): ActionResponse<T, false, undefined, string> {
    return new ActionResponse(type, false, undefined, message);
  }
}

export type AnyActionResponse = ActionResponse<ActionType>