import { VERSION } from "./version";
import { OptionalType, RequiredType } from "@jonloucks/badges-ts/api/Types";
import { Config as BadgeConfig, Badge } from "@jonloucks/badges-ts/api/Badge";
import { Config as BadgesConfig, Badges } from "@jonloucks/badges-ts/api/Badges";
import { BadgeException } from "@jonloucks/badges-ts/api/BadgeException";
import type { Installer, Config as InstallerConfig } from "@jonloucks/badges-ts/api/Installer";
import { create as createInstaller } from "./impl/Installer.impl";

export type {
  Badge,
  BadgeConfig,
  Badges,
  BadgesConfig,
  RequiredType,
  OptionalType,
  Installer,
  InstallerConfig
};

export {
  VERSION,
  BadgeException,
  createInstaller
};