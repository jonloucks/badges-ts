/**
 * Interface representing a project, including its name, version, and optional repository information. 
 * This interface is used to define the structure of a project object that can be utilized in various contexts within the badges-ts CLI, such as when generating badges or managing project metadata.
 */
export interface Project {

  /* The name of the project, used for identification and logging purposes. This should correspond to the name defined in the project's package.json or other relevant configuration files. */
  name: string;

  /* The version of the project, used for identification and logging purposes. This should correspond to the version defined in the project's package.json or other relevant configuration files. */
  version: string;

  /* Optional repository information for the project, which may include a URL to the project's source code repository (e.g., GitHub). This can be used for reference or to provide additional context about the project when generating badges or managing project metadata. */
  repository?: string;
}