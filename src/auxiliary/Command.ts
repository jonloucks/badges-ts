import { Display, Flags } from "@jonloucks/badges-ts/api/Types";
import { Environment } from "@jonloucks/variants-ts/api/Environment";

export interface Command<T> {

  execute(context: Context): Promise<T>;

}

export interface Context {

  arguments: string[];

  display: Display;

  flags: Flags;

  environment: Environment;
}