import { AutoClose, AutoCloseMany, inlineAutoClose } from "@jonloucks/contracts-ts/api/AutoClose";
import { AutoOpen } from "@jonloucks/contracts-ts/api/AutoOpen";
import { Repository } from "@jonloucks/contracts-ts/api/Repository";
import { Installer, Config } from "@jonloucks/badges-ts/api/Installer";
import { CONTRACT as REPOSITORY_FACTORY } from "@jonloucks/contracts-ts/api/RepositoryFactory";
import { CONTRACT as DISCOVER_COVERAGE, DiscoverCoverage } from "@jonloucks/badges-ts/auxiliary/DiscoverCoverage";
import { CONTRACT as DISCOVER_PROJECT, DiscoverProject } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { CONTRACT as BADGE_FACTORY, BadgeFactory } from "@jonloucks/badges-ts/api/BadgeFactory";
import { CONTRACT as AUTO_CLOSE_FACTORY } from "@jonloucks/contracts-ts/api/AutoCloseFactory";
import { CONTRACT as IDEMPOTENT_FACTORY } from "@jonloucks/contracts-ts/auxiliary/IdempotentFactory";
import { Idempotent } from "@jonloucks/contracts-ts/auxiliary/Idempotent";
import { Contracts } from "@jonloucks/contracts-ts/api/Contracts";

import { create as createBadgeFactory } from "./BadgeFactory.impl.js";
import { create as createDiscoverProject } from "./DiscoverProject.impl.js";
import { create as createDiscoverCoverage } from "./DiscoverCoverage.impl.js";
import { Internal } from "./Internal.impl.js";

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
    return this.#idempotent.open();
  }

  /* @override AutoOpen.autoOpen */
  autoOpen(): AutoClose {
    return this.open();
  }

  static internalCreate(config?: Config): Installer {
    return new InstallerImpl(config);
  }

  #open(): AutoClose {
    const repository: Repository = this.#contracts.enforce(REPOSITORY_FACTORY).createRepository();
    repository.keep(DISCOVER_PROJECT, (): DiscoverProject => createDiscoverProject({ contracts: this.#contracts }));
    repository.keep(DISCOVER_COVERAGE, (): DiscoverCoverage => createDiscoverCoverage({ contracts: this.#contracts }));
    repository.keep(BADGE_FACTORY, (): BadgeFactory => createBadgeFactory({ contracts: this.#contracts }));
    this.#closeMany.add(repository.open());
    return inlineAutoClose((): void => this.#close());
  }

  #close(): void {
    this.#closeMany.close();
  }

  private constructor(config?: Config) {
    this.#contracts = Internal.resolveContracts(config);
    this.#closeMany = this.#contracts.enforce(AUTO_CLOSE_FACTORY).createAutoCloseMany();
    this.#idempotent = this.#contracts.enforce(IDEMPOTENT_FACTORY).createIdempotent({
      contracts: this.#contracts,
      open: (): AutoClose => this.#open()
    });
  }

  #contracts: Contracts;
  #idempotent: Idempotent;
  #closeMany: AutoCloseMany;
}