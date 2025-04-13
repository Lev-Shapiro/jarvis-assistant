export class AIPrice {
  constructor(
    public readonly amount: number,
    public readonly unit: 'per1k' = 'per1k',
  ) {}

  calculateCost(tokens: number): number {
    return (this.amount * tokens) / 1000;
  }

  static set(amount: number) {
    return new AIPrice(amount);
  }
}
