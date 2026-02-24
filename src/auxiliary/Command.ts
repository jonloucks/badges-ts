import { type Context } from "@jonloucks/badges-ts/api/Types";

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

export { Context };

