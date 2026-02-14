import { Display, Flags } from "@jonloucks/badges-ts/api/Types";

export interface Config {
  name: string;
  templatePath: string;
  outputPath: string;
  label: string;
  value: string;
  color: string;
  flags: Flags;
  display: Display;
}

export interface Badge {
  name: string;
  outputPath: string;
}