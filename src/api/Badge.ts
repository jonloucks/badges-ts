import { Display, Flags } from "./Types";

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