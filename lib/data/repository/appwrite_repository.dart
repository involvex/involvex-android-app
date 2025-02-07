import 'package:appwrite/appwrite.dart';
import 'package:appwrite_flutter_starter_kit/data/models/log.dart';
import 'package:appwrite_flutter_starter_kit/data/models/project_info.dart';
import 'package:intl/intl.dart';

/// A repository responsible for handling network interactions with the Appwrite server.
///
/// It provides a helper method to ping the server.
class AppwriteRepository {
  static const String pingPath = "/ping";
  static const String appwriteVersion = "1.6.1";
  static const String appwriteProjectId = "project-id";
  static const String appwriteProjectName = "My project";
  static const String appwritePublicEndpoint = "https://cloud.appwrite.io/v1";

  final Client _client = Client()
      .setProject(appwriteProjectId)
      .setEndpoint(appwritePublicEndpoint);

  late final Account _account;
  late final Databases _databases;

  AppwriteRepository._internal() {
    _account = Account(_client);
    _databases = Databases(_client);
  }

  static final AppwriteRepository _instance = AppwriteRepository._internal();

  /// Singleton instance getter
  factory AppwriteRepository() => _instance;

  ProjectInfo getProjectInfo() {
    return ProjectInfo(
      endpoint: appwritePublicEndpoint,
      projectId: appwriteProjectId,
      projectName: appwriteProjectName,
      version: appwriteVersion,
    );
  }

  /// Pings the Appwrite server and captures the response.
  ///
  /// @return [Log] containing request and response details.
  Future<Log> ping() async {
    try {
      final response = await _client.ping();

      return Log(
        date: _getCurrentDate(),
        status: 200,
        method: "GET",
        path: pingPath,
        response: response,
      );
    } on AppwriteException catch (error) {
      return Log(
        date: _getCurrentDate(),
        status: error.code ?? 500,
        method: "GET",
        path: pingPath,
        response: error.message ?? "Unknown error",
      );
    }
  }

  /// Retrieves the current date in the format "MMM dd, HH:mm".
  ///
  /// @return [String] A formatted date.
  String _getCurrentDate() {
    return DateFormat("MMM dd, HH:mm").format(DateTime.now());
  }
}
