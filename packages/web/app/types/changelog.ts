/**
 * Changelog Type Definitions
 * Defines the structure for version changelogs
 */

export interface ChangelogChange {
  [key: string]: string[];
}

export interface ChangelogFeature {
  title: string;
  description: string;
  components: string[];
}

export interface ChangelogTechnicalDetails {
  dependencies: string;
  breakingChanges: string;
  migrations: string;
  compatibility: string;
}

export interface Changelog {
  version: string;
  releaseDate: string;
  status: "Latest" | "Stable" | "Beta" | "Deprecated";
  highlights: string[];
  changes: ChangelogChange;
  features: ChangelogFeature[];
  technicalDetails: ChangelogTechnicalDetails;
}
