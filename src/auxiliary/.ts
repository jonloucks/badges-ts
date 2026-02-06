export interface Console {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  dryRun(message: string): void;
}