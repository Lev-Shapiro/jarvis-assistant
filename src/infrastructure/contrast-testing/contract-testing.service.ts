import { wait } from "@/scripts/wait";
import { JarvisAIService } from "../brain/jarvis-ai.service";
import { BrowserConnectionService } from "../browser/browser-connection.service";
import { BrowserActionsService } from "../browser/executor/executor";
import { InfobarType } from "../infobar/infobar-type";
import { InfobarService, InfobarUpdatePayload } from "../infobar/infobar.service";
import { ProgressStatus } from "../infobar/types/progress-status";
import { TextFormatType } from "../infobar/types/text-format-type";

export class ContractTestingService {
  DELAY_BETWEEN_TESTS = 2000;

  constructor(
    private readonly browserConnectionService: BrowserConnectionService,
    private readonly browserActionsService: BrowserActionsService,
    private readonly jarvisAiService: JarvisAIService,
    private readonly infobarService: InfobarService
  ) {}
  
  public async startContrastTesting() {
    await this.jarvisAiService.speak('Starting contrast testing');

    await this.displayInfo({
      type: InfobarType.FormattedText,
      content: `const contract = {
        name: 'Contract',
        description: 'Contract description',
        amount: 1000,
        status: 'active'
      }`,
      format: TextFormatType.Code
    });

    await this.displayInfo({
      type: InfobarType.Table,
      headers: ['Name', 'Description', 'Amount', 'Status'],
      rows: [
        ['Contract A', 'Premium service contract', '$2,500', 'active'],
        ['Contract B', 'Maintenance agreement', '$750', 'pending'],
        ['Contract C', 'Software license', '$1,200', 'active'],
        ['Contract D', 'Consulting services', '$3,000', 'expired'],
        ['Contract E', 'Support package', '$500', 'active'],
        ['Contract F', 'Hardware lease', '$1,800', 'on hold'],
        ['Contract G', 'Training services', '$950', 'active'],
        ['Contract H', 'Cloud storage plan', '$350', 'pending'],
      ],
    });

    await this.displayInfo({
      type: InfobarType.Image,
      src: 'https://images.squarespace-cdn.com/content/v1/5e10bdc20efb8f0d169f85f9/09943d85-b8c7-4d64-af31-1a27d1b76698/arrow.png',
      alt: 'Contract image',
      width: 350,
      height: 350
    });

    await this.displayInfo({
      type: InfobarType.ListItems,
      items: [
        {
          type: InfobarType.ListItems,
          id: 'contract-a',
          text: 'Contract A',
          checked: true
        },
        {
          type: InfobarType.ListItems,
          id: 'contract-b',
          text: 'Contract B',
          checked: false
        },
        {
          type: InfobarType.ListItems,
          id: 'contract-c',
          text: 'Contract C',
          checked: false
        },
      ]
    });

    await this.displayInfo({
      type: InfobarType.Planner,
      tasks: [
        {
          title: 'Opening Browser',
          description: 'Opening Browser',
          status: ProgressStatus.Done,
          dueDate: new Date()
        },
        {
          title: 'Navigating to LinkedIn',
          description: 'Navigating to LinkedIn',
          status: ProgressStatus.InProgress,
          dueDate: new Date()
        },
        {
          title: 'Searching for Full Stack Positions',
          description: 'Searching for Full Stack Positions',
          status: ProgressStatus.Todo,
          dueDate: new Date()
        },
        {
          title: 'Applying to Full Stack Positions',
          description: 'Applying to Full Stack Positions',
          status: ProgressStatus.Todo,
          dueDate: new Date()
        },
        {
          title: 'Closing LinkedIn',
          description: 'Closing LinkedIn',
          status: ProgressStatus.Todo,
          dueDate: new Date()
        }
      ]
    });

    await this.jarvisAiService.speak('Contrast testing complete');

    // await this.browserConnectionService.connect({ waitUntilConnected: true });

    // await this.jarvisAiService.speak('Browser connected. Let\'s start with opening LinkedIn');

    // await this.browserActionsService.navigateTo({ url: 'https://www.linkedin.com' });

    // await this.jarvisAiService.speak('LinkedIn opened. Now let\'s search for Full Stack Positions');

    // await this.browserActionsService.clickElement({
    //   selector: "input.basic-input"
    // });

    // await this.browserActionsService.typeText({
    //   selector: "input.basic-input",
    //   text: "Full Stack"
    // });

    // await this.browserActionsService.keyPress({
    //   key: 'Enter',
    //   selector: "input.basic-input"
    // });

    // await wait(2500);

    // await this.jarvisAiService.speak('Now let\'s scroll down the page');

    // await this.browserActionsService.scrollPage({
    //   direction: 'down',
    //   amount: 100
    // });

    // await this.jarvisAiService.speak('Finished. Let\'s close LinkedIn');

    // await this.browserActionsService.closeTab();

    // await this.jarvisAiService.speak("Testing complete. Disconnecting from browser");
    
    // await this.browserConnectionService.disconnect();
  }

  private async displayInfo(data: InfobarUpdatePayload) {
    this.infobarService.display(data);

    await wait(this.DELAY_BETWEEN_TESTS);

    this.infobarService.clear();
  }
}