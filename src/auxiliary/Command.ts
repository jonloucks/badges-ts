import { Display, Flags } from "@jonloucks/badges-ts/api/Types";

export interface Command<T> {

  execute(context: Context): Promise<T>;

}

export interface Context {

  arguments: string[];

  display: Display;

  flags: Flags;
}