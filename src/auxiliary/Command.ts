import { Display, Flags } from "@jonloucks/badges-ts/api/Types";
import { Environment } from "@jonloucks/variants-ts/api/Environment";

/**
 * Command interface representing an executable action within the badges-ts CLI.
 * Each command should implement the execute method, which takes a Context object as an argument and returns a Promise of a generic type T.
 * The Context provides access to the command's arguments, display functions for logging, flags for command options, and the environment for accessing variances and other contextual information.
 */
export interface Command<T> {

  /**
   * Executes the command logic using the provided context.
   * @param context - The context in which the command is executed, containing arguments, display functions, flags, and environment.
   * @returns A promise that resolves to a value of type T, which can be used to return results from the command execution.
   */
  execute(context: Context): Promise<T>;
}

/**
 * Context interface representing the execution context for a command within the badges-ts CLI.
 * It includes the command-line arguments, display functions for logging, flags for command options, and the environment for accessing variances and other contextual information.
 */
export interface Context {

  /* The command-line arguments passed to the command, typically from process.argv.slice(2). */
  arguments: string[];

  /* The display functions for logging and output within the command. */
  display: Display;

  /* The flags for command options, typically parsed from the command-line arguments. */
  flags: Flags;

  /* The environment for accessing variances and other contextual information. */
  environment: Environment;
}