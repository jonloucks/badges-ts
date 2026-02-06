import { Badge } from "@jonloucks/badges-ts/api/Badge";

export interface Config {
  verbose?: boolean;
  dryRun?: boolean;
  createFolders?: boolean;
}

export interface Badges {
  createBadges(config: Config): Promise<Badge[]>;
}