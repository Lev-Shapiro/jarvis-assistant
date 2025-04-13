export class Person {
  constructor(
    private readonly _name: string,
    private readonly _probability: number
  ) {}

  get name(): string {
    return this._name;
  }

  get probability(): number {
    return this._probability;
  }

  get formattedProbability(): string {
    return `${(this._probability * 100).toFixed(2)}%`;
  }
} 