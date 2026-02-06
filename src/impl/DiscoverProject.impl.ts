import { join } from "path";
import { readFile } from "fs/promises";
import { Project } from "@jonloucks/badges-ts/api/Project";
import { DiscoverProject } from "@jonloucks/badges-ts/auxiliary/DiscoverProject";
import { isNonEmptyString, used } from "@jonloucks/badges-ts/auxiliary/Checks";
import { BadgeException } from "@jonloucks/badges-ts/api/BadgeException";
import { isNotPresent } from "@jonloucks/badges-ts/api/Types";

export function create(): DiscoverProject {
  return DiscoverProjectImpl.internalCreate();
}

// ---- Implementation details below ----

interface PackageJson {

  name: string;

  version: string;

  repository?: { url: string };
}

class DiscoverProjectImpl implements DiscoverProject {

  async discoverProject(): Promise<Project> {
    return Promise.any([
      this.detectPackageJson()
      // Future detection methods can be added here
      // for example, detectGradle(), detectMaven(), etc.
    ]);
  }

  static internalCreate(): DiscoverProject {
    return new DiscoverProjectImpl();
  }

  async detectPackageJson(): Promise<Project> {
    const fileName: string = join(process.cwd(), 'package.json');
    try {
      const fileContent: string = await readFile(fileName, 'utf8');
      const packageJson: PackageJson = JSON.parse(fileContent) as PackageJson;
      if (isNonEmptyString(packageJson.name) && isNonEmptyString(packageJson.version)) {
        return packageJsonToProject(packageJson);
      } else {
        throw new BadgeException("Invalid name or version in package.json.");
      }
    } catch (error) {
      used(error)
      throw new BadgeException("Failed to detect project from package.json.");
    }
  };
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

