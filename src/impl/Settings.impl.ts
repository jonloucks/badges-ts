import { Settings } from "@jonloucks/badges-ts/api/Settings";
import { AutoClose, AutoOpen } from "@jonloucks/contracts-ts";
import { AUTO_CLOSE_NONE } from "@jonloucks/contracts-ts/api/AutoClose";

export interface SettingsConfig {
  verbose?: boolean;
  dryRun?: boolean;
  autoCreateFolders?: boolean;
}

export function create(): Settings {
  return SettingsImpl.internalCreate();
}

// ---- Implementation details below ----


class SettingsImpl implements Settings, AutoOpen {
  get verbose(): boolean {
    return this.#verbose;
  }

  get dryRun(): boolean {
    return this.#dryRun;
  }

  get autoCreateFolders(): boolean {
    return this.#autoCreateFolders;
  }

  autoOpen(): AutoClose {
    // //Load settings from 'badges-ts.config.ts', 'badges-ts.config.json', or .badges-tsrc
    //   if (isPresent(config)) {
    //     this.#verbose = config.verbose ?? false;
    //     this.#dryRun = config.dryRun ?? false;
    //     this.#autoCreateFolders = config.autoCreateFolders ?? true;
    //   }
    // });
    return AUTO_CLOSE_NONE; // no resources to clean up
  }

  static internalCreate(): Settings {
    return new SettingsImpl();
  }

  private constructor() {
    this.#verbose = false;
    this.#dryRun = true;
    this.#autoCreateFolders = true;
  }

  #verbose: boolean;
  #dryRun: boolean;
  #autoCreateFolders: boolean;
};

