import { Display, Flags } from "@jonloucks/badges-ts/api/Types";

/**
 * Interface representing the configuration for creating a badge. 
 * This includes properties such as the name of the badge, paths for the template and output, label and value for the badge, color, and any flags or display options that may influence how the badge is generated or displayed.
 */
export interface Config {
  /* The name of the badge to be created, used for identification and logging purposes. */
  name: string;
  /* The file path to the badge template, which is used as the basis for generating the badge. The template should contain placeholders for label, value, and color that will be replaced with actual values during badge generation. */
  templatePath: string;
  /* The file path where the generated badge will be saved. This should be a valid path on the filesystem where the process has write permissions. */
  outputPath: string;
  /* The label to be displayed on the badge, typically representing the type of information the badge is conveying (e.g., "coverage", "npm"). */
  label: string;
  /* The value to be displayed on the badge, typically representing the specific information or metric associated with the badge (e.g., "95%", "v1.0.0"). */
  value: string;
  /* The color to be used for the badge background, typically represented as a hex code (e.g., "#4bc124") or a named color (e.g., "green"). This color will be applied to the generated badge to visually indicate the status or level of the information being conveyed. */
  color: string;
  /* Flags that may influence how the badge is generated or displayed, such as whether to perform a dry run (not actually writing the badge to disk) or to enable verbose logging during the badge creation process. */
  flags: Flags;
  /* Display functions for logging and output within the badge creation process, allowing for consistent messaging and feedback to the user during badge generation. */
  display: Display;
}

/**
 * Interface representing a badge that has been generated, including its name and the output path where it is saved. 
 * This interface is used to represent the result of a badge creation process, allowing for easy access to the badge's identifying information and location on the filesystem.
 */
export interface Badge {
  /* The name of the badge, used for identification and logging purposes. This should correspond to the name provided in the Config when creating the badge. */
  name: string;
  /* The file path where the generated badge is saved. This should be the same as the outputPath provided in the Config when creating the badge, indicating where the badge can be found on the filesystem. */
  outputPath: string;
}