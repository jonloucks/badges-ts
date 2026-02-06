import { Contracts } from "@jonloucks/contracts-ts";
import { Open } from "@jonloucks/contracts-ts/api/Open";

export interface Config {
  contracts?: Contracts;
}

export { Open as Installer };

