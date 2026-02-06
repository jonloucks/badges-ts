import { Badge, Config as BadgeConfig } from "@jonloucks/badges-ts/api/Badge";

export interface BadgeFactory {

  createBadge(config: BadgeConfig): Promise<Badge>;

}