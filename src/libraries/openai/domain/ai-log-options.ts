export class AILogOptions {
  /** Is true in case either pricing or performance logging is enabled */
  logging: boolean = false;

  /**
   * Options for logging AI responses.
   * @param title The title of the request. Shown in the console.
   * @param logPricing If true, logs pricing information.
   * @param logPerformance If true, logs performance information.
   * @param saveLogToStorage If true, saves the log to the Google Sheets storage.
   */
  constructor(
    public readonly title: string,
    public readonly logPricing: boolean,
    public readonly logPerformance: boolean,
    public readonly saveLogToStorage: boolean,
  ) {
    this.logging = logPricing || logPerformance;

    this.logPricing = logPricing;
    this.logPerformance = logPerformance;

    this.saveLogToStorage = saveLogToStorage;
  }

  /**
   * Returns a AILogOptions object with all flags set to false,
   * which means no logging is enabled.
   *
   * @return {AILogOptions} The AILogOptions object with all flags set to false.
   */
  static default(title: string): AILogOptions {
    return new AILogOptions(title, false, false, false);
  }

  /**
   * Returns a AILogOptions object with all flags set to true,
   * which means all logging is enabled.
   *
   * @return {AILogOptions} The AILogOptions object with all flags set to true.
   */
  static playground(title: string): AILogOptions {
    return new AILogOptions(title, true, true, false);
  }

  /**
   * Returns a AILogOptions object with all flags set to false,
   * which means no logging is enabled. The saveLogToStorage flag is set to true,
   * so the log will be saved to storage.
   *
   * @return {AILogOptions} The AILogOptions object with all flags set to false.
   */
  static production(title: string): AILogOptions {
    return new AILogOptions(title, false, false, true);
  }

  /**
   * Returns a AILogOptions object with the following flags set to false:
   * - logPricing
   * - logProgress
   * - logPerformance
   *
   * The saveLogToStorage flag is set to true, which means log will be saved to storage.
   *
   * @return {AILogOptions} The AILogOptions object with the specified flags set.
   */
  static full(title: string): AILogOptions {
    return new AILogOptions(title, true, true, true);
  }
}
