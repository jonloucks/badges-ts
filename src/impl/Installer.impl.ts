import { AutoClose, AutoOpen, PROMISOR_FACTORY, PromisorFactory, Repository, REPOSITORY_FACTORY } from "@jonloucks/contracts-ts";
import { Installer, Config } from "@jonloucks/badges-ts/api/Installer";
import { CONTRACT as SETTINGS_CONTRACT } from "@jonloucks/badges-ts/api/Settings";
import { CONTRACT as DISCOVER_PROJECT } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { create as createDiscoverProject } from "./DiscoverProject.impl";
import { create as createSettingsImpl } from "./Settings.impl";
import { Internal } from "./Internal.impl";

export { Installer, Config } from "@jonloucks/badges-ts/api/Installer";

export function create(config?: Config): Installer {
  return InstallerImpl.internalCreate(config);
}

// ---- Implementation details below ----

class InstallerImpl implements Installer, AutoOpen {
  open(): AutoClose {
    return this.#repository.open();
  }

  autoOpen(): AutoClose {
    return this.open();
  }

  static internalCreate(config?: Config): Installer {
    return new InstallerImpl(config);
  }

  private constructor(config?: Config) {
    const contracts = Internal.resolveContracts(config);
    const promisorFactory : PromisorFactory = contracts.enforce(PROMISOR_FACTORY);
    this.#repository = contracts.enforce(REPOSITORY_FACTORY).createRepository();
    this.#repository.keep(SETTINGS_CONTRACT, promisorFactory.createLifeCycle(() => createSettingsImpl()));
    this.#repository.keep(DISCOVER_PROJECT, createDiscoverProject());
  }

  #repository: Repository;
}