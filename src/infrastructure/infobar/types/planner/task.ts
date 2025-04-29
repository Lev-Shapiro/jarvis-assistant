import { ProgressStatus } from "../progress-status";

export interface PlannerTask {
  title: string;
  description: string;
  status: ProgressStatus;
  dueDate?: Date;
}