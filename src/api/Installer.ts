import type { Contracts } from "@jonloucks/contracts-ts";
import type { Open } from "@jonloucks/contracts-ts/api/Open";

export interface Config {
  contracts?: Contracts;
}

export type { Open as Installer };

