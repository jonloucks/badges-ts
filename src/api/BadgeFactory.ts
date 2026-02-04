import { Badge, Config as BadgeConfig } from "./Badge";

export interface BadgeFactory {
  createBadge(config: BadgeConfig): Badge
}