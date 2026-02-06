export interface Config {
  name: string;
  templatePath?: string;
  outputPath: string;
  label: string;
  value: string;
  color: string;
  createFolders?: boolean;
}

export interface Badge {
  name: string;
  outputPath: string;
}