
// TODO: Review
// Interfaces for each Infobar Type

import { InfobarType } from "./infobar-type";
import { PlannerTask } from "./types/planner/task";
import { ProgressStatus } from "./types/progress-status";
import { TextFormatType } from "./types/text-format-type";

export interface PlannerData {
  type: InfobarType.Planner;

  tasks: PlannerTask[];
}

export interface ProgressTrackingData {
  type: InfobarType.ProgressTracking;

  label: string;
  description?: string;
  currentValue: ProgressStatus;
  targetValue: ProgressStatus;
  unit?: string;
}

export interface TableData {
  type: InfobarType.Table;
  
  headers: string[];
  rows: Array<Array<string | number | boolean>>; // Allow boolean values as well
}

export interface FormattedTextData {
  type: InfobarType.FormattedText;

  content: string;
  format: TextFormatType;
}

export interface ImageData {
  type: InfobarType.Image;

  src: string;
  alt?: string;
  caption?: string;
  width: number;
  height: number;
}

export interface VideoData {
  type: InfobarType.Video;

  src: string;
  caption?: string;
  autoplay?: boolean;
  controls?: boolean;
  width: number;
  height: number;
}

export interface ListItem {
  type: InfobarType.ListItems;

  id: string;
  text: string;
  checked?: boolean;
}

export interface ListItemsData {
  type: InfobarType.ListItems;

  items: ListItem[];
  ordered?: boolean;
}

export interface GalleryItem {
  type: InfobarType.GalleryItems;

  id: string;
  items: ImageData[];
}
