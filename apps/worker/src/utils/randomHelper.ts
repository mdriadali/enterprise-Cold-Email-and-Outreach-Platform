export class RandomHelper {
  static randomDealy(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}