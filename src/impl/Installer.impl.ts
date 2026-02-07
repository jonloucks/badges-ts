import { AutoClose, AutoOpen, Repository, REPOSITORY_FACTORY } from "@jonloucks/contracts-ts";
import { Installer, Config } from "@jonloucks/badges-ts/api/Installer";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACT as BADGE_FACTORY } from "@jonloucks/badges-ts/api/BadgeFactory";
import { create as createBadgeFactory } from "./BadgeFactory.impl";
import { create as createDiscoverProject } from "./DiscoverProject.impl";
import { Internal } from "./Internal.impl";

export { Installer, Config } from "@jonloucks/badges-ts/api/Installer";

/**
 * Factory function to create an instance of Installer.
 * 
 * @param config Optional configuration for the Installer instance.
 * @returns An instance of Installer.
 */
export function create(config?: Config): Installer {
  return InstallerImpl.internalCreate(config);
}

// ---- Implementation details below ----

class InstallerImpl implements Installer, AutoOpen {

  /* @override AutoOpen.open */
  open(): AutoClose {
    return this.#repository.open();
  }

  /* @override AutoOpen.autoOpen */
  autoOpen(): AutoClose {
    return this.open();
  }

  static internalCreate(config?: Config): Installer {
    return new InstallerImpl(config);
  }

  private constructor(config?: Config) {
    const contracts = Internal.resolveContracts(config);
    this.#repository = contracts.enforce(REPOSITORY_FACTORY).createRepository();
    this.#repository.keep(DISCOVER_PROJECT, () => createDiscoverProject());
    this.#repository.keep(BADGE_FACTORY, () => createBadgeFactory()); 
  }

  #repository: Repository;
}