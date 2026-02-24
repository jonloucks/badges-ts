import { BadgeException } from "@jonloucks/badges-ts/api/BadgeException";
import { Project } from "@jonloucks/badges-ts/api/Project";
import { isNotPresent } from "@jonloucks/badges-ts/api/Types";
import { KIT_PACKAGE_JSON_PATH, KIT_PROJECT_FOLDER, resolveVariant } from "@jonloucks/badges-ts/api/Variances";
import { isNonEmptyString, used } from "@jonloucks/badges-ts/auxiliary/Checks";
import { Context } from "@jonloucks/badges-ts/auxiliary/Command";
import { DiscoverProject } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { Contracts } from "@jonloucks/contracts-ts/api/Contracts";
import { readFile } from "fs/promises";

export interface Config {
  contracts: Contracts;
}

/**
 * Factory function to create a DiscoverProject instance
 * @param config the configuration for creating the DiscoverProject instance
 * @returns a DiscoverProject instance
 */
export function create(config: Config): DiscoverProject {
  return DiscoverProjectImpl.internalCreate(config);
}

// ---- Implementation details below ----

interface PackageJson {

  name: string;

  version: string;

  repository?: { url: string };
}

class DiscoverProjectImpl implements DiscoverProject {

  async discoverProject(context: Context): Promise<Project> {
    return Promise.any([
      this.detectPackageJson(context)
      // Future detection methods can be added here
      // for example, detectGradle(), detectMaven(), etc.
    ]).catch((error) => {
      used(error)
      throw new BadgeException("Unable to discover project using available methods.");
    });
  }

  static internalCreate(config: Config): DiscoverProject {
    return new DiscoverProjectImpl(config);
  }

  async detectPackageJson(context: Context): Promise<Project> {
    return await new Promise<Project>(async (deliver, reject) => {
      try {
        const fileName: string = this.#getPackageJsonPath(context);
        const fileContent: string = await readFile(fileName, 'utf8');
        const packageJson: PackageJson = JSON.parse(fileContent) as PackageJson;
        if (isNonEmptyString(packageJson.name) && isNonEmptyString(packageJson.version)) {
          deliver(packageJsonToProject(packageJson));
        } else {
          reject(new BadgeException("Invalid name or version in package.json."));
        }
      } catch (error) {
        used(error)
        reject(new BadgeException("Failed to detect project from package.json."));
      }
    });
  };

  #getPackageJsonPath(context: Context): string {
    return resolveVariant(context.environment, KIT_PROJECT_FOLDER, KIT_PACKAGE_JSON_PATH);
  }

  private constructor(config: Config) {
    this.#contracts = config.contracts;
  }

  readonly #contracts: Contracts;
}

function packageJsonToProject(packageJson: PackageJson): Project {
  return {
    name: packageJson.name.trim(),
    version: packageJson.version.trim(),
    repository: discoverRepository(packageJson)
  };
};

function discoverRepository(packageJson: PackageJson): string | undefined {
  if (isNotPresent(packageJson.repository) || isNotPresent(packageJson.repository.url)) {
    return undefined;
  }

  let repository: string = packageJson.repository!.url;
  repository = repository.trim();
  if (repository.endsWith('.git')) {
    repository = repository.slice(0, -4);
  }
  if (repository.startsWith('git+')) {
    repository = repository.slice(4);
  }
  return repository.trim();
}

