import WebSocket from "ws";

export class BrowserReceptors {
  handleConnection(connection: WebSocket) {
    console.log("Client connected");
  }

  handleMessage(message: WebSocket.RawData) {
    console.log("Message received:", message);
  }

  handleDisconnection(connection: WebSocket) {
    console.log("Client disconnected");
  }
}