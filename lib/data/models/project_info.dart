/// A data model for holding appwrite project information.
class ProjectInfo {
  final String endpoint;
  final String projectId;
  final String projectName;
  final String version;

  ProjectInfo({
    required this.endpoint,
    required this.projectId,
    required this.projectName,
    required this.version,
  });
}
