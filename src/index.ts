import { VERSION } from "@jonloucks/badges-ts/version";
import type { OptionalType, RequiredType } from "@jonloucks/badges-ts/api/Types";
import type { Config as BadgeConfig, Badge } from "@jonloucks/badges-ts/api/Badge";
import type { Config as BadgesConfig, Badges } from "@jonloucks/badges-ts/api/Badges";
import { BadgeException } from "@jonloucks/badges-ts/api/BadgeException";
import type { Installer, Config as InstallerConfig } from "@jonloucks/badges-ts/api/Installer";
import { create as createInstaller } from "./impl/Installer.impl.js";

export {
  Badge,
  BadgeConfig,
  Badges,
  BadgesConfig,
  RequiredType,
  OptionalType,
  Installer,
  InstallerConfig,
  VERSION,
  BadgeException,
  createInstaller
};