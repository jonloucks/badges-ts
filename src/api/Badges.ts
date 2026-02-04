import { Badge } from "@jonloucks/badges-ts/api/Badge";

export interface Config {
  debugMode?: boolean;
  createFolders?: boolean;
}

export interface Badges {

  generateBadges(config: Config): Promise<Badge[]>;  

}