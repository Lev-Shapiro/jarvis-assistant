import { ActionResponse } from "@/domain/action/regular/action-response";
import { ActionType } from "@/domain/action/regular/action-type";
import { MessageRequest, MessageResponse } from "@/domain/message/message";
import { wait } from "@/scripts/wait";
import WebSocket from "ws";
import { ConnectionStatus } from "../../domain/connection-status";
import { BrowserReceptors } from "../../receptors/shortcuts/browser-receptors";
import { ConnectionRepository } from "./connection-repository";

interface BrowserServiceOptions {
  waitUntilConnected?: boolean;
}

export class BrowserConnectionService {
  private server: WebSocket.Server | null = null;

  constructor(
    private connectionRepostiory: ConnectionRepository,
    private receptors: BrowserReceptors
  ) {}

  public get isReady(): boolean {
    return this.connectionRepostiory.status === ConnectionStatus.CONNECTED;
  }

  public async connect(options: BrowserServiceOptions = {}) {
    if (this.server) {
      console.log("Browser is already connected");
      return;
    }

    this.server = new WebSocket.Server({ port: 8080, host: "localhost" });

    this.server.on("connection", (socket) => {
      console.log("Browser connected");
      
      this.connectionRepostiory.markAsConnected();
      this.receptors.handleConnection(socket);

      socket.on("message", (message) => {
        this.receptors.handleMessage(message);
      });
      
      socket.on("close", () => {
        this.connectionRepostiory.markAsNotConnected();
        this.receptors.handleDisconnection(socket);
      });
    });
    
    if (options.waitUntilConnected) {
      await this.waitUntilConnected();
    }
  }

  public async waitUntilConnected() {
    while (!this.isReady) {
      console.log("Waiting for browser connection...");
      await wait(1000);
    }
  }

  public async disconnect() {
    this.connectionRepostiory.markAsNotConnected();
    this.server?.close();
  }

  public async sendMessage<T extends ActionType>(data: MessageRequest<T>): Promise<MessageResponse<T, true, ActionResponse<T>[]>> {
    this.verifyConnection();

    return new Promise((resolve, reject) => {
      this.server?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data), (error) => {
            // TODO: Handling results in a consequent (pending) connection request
            error ? reject(error) : resolve(MessageResponse.success([]));
          });
        }
      });
    });
  }

  private verifyConnection() {
    if (!this.isReady) {
      throw new Error("Browser is not ready");
    }
  }
}
