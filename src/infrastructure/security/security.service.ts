import { Person } from "@/domain/person/Person";
import { FaceApiService } from "@/libraries/faceapi/faceapi.service";
import { ErrorNotificationService } from "../error-notification/error-notification.service";
import { ComputerVisionService } from "./computer-vision.service";
import { SecurityProtocolService } from "./security-protocol.service";

export class SecurityService {
  private isDetectionReady = false;

  private stopCameraStream: () => Promise<void> = () => Promise.resolve();

  constructor(
    private readonly computerVisionService: ComputerVisionService,
    private readonly securityProtocolService: SecurityProtocolService,
    private readonly faceApiService: FaceApiService,
    private readonly errorNotificationService: ErrorNotificationService
  ) {}

  async loadTrainingData() {
    await this.faceApiService.loadTrainingData();
    this.isDetectionReady = true;
  }

  async activate() {
    if(!this.isDetectionReady) {
      this.errorNotificationService.notify({
        message: "Security service not ready",
        isCritical: true,
        isTerminal: true,
        isApp: true,
        isAudio: true
      });

      return;
    }

    // Start a video stream
    const stopCameraStream = await this.computerVisionService.startVideoStream(
      async (imagePath) => {
        const people = await this.faceApiService.recognizePeople(imagePath);
        console.log("People detected:", people);
        await this.handlePeopleDetection(people);
      }
    );

    this.stopCameraStream = stopCameraStream;
  }

  async deactivate() {
    if(!this.stopCameraStream) {
      this.errorNotificationService.notify({
        message: "Security service not started",
        isCritical: true,
        isTerminal: true,
        isApp: true,
        isAudio: true
      });

      return;
    }

    this.securityProtocolService.deactivateProtocol();
    await this.stopCameraStream();
  }

  private async handlePeopleDetection(people: Person[]) {
    const hasLev = people.some(person => person.name === "Lev");

    if(hasLev && this.securityProtocolService.isProtocolActive) {
      this.securityProtocolService.deactivateProtocol();
    } 

    if(!hasLev && !this.securityProtocolService.isProtocolActive) {
      this.securityProtocolService.activateProtocol();
    }
  }
}
