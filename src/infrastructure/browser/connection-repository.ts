import { ConnectionStatus } from "../../domain/connection-status";

export class ConnectionRepository {
  private _status: ConnectionStatus = ConnectionStatus.WAITING_FOR_CONNECTION;
  
  public get isReady(): boolean {
    return this._status === ConnectionStatus.CONNECTED;
  }

  public get status(): ConnectionStatus {
    return this._status;
  }

  markAsConnected() {
    this._status = ConnectionStatus.CONNECTED;
  }

  markAsNotConnected() {
    this._status = ConnectionStatus.NOT_CONNECTED;
  }

  markAsWaitingForConnection() {
    this._status = ConnectionStatus.WAITING_FOR_CONNECTION;
  }
}