import { BrowserWindowConstructorOptions } from "electron";

// Base window config extends Electron's BrowserWindowConstructorOptions
export type BaseWindowConfig = Partial<BrowserWindowConstructorOptions>;

export interface WindowConfig extends BaseWindowConfig {
  width: number;
  height: number;
}