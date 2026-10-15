/**
 * Runtime permissions + notification channel setup.
 *
 * Android 13 (API 33) introduced POST_NOTIFICATIONS as a *runtime* permission -
 * declaring it in the manifest is not enough, the user has to be prompted.
 * Android 8 (API 26) also requires every notification to belong to a channel,
 * so a channel must exist before anything can be shown.
 */

import { PermissionsAndroid, Platform } from "react-native";

export const NOTIFICATION_CHANNEL_ID = "involvex-default";
export const NOTIFICATION_CHANNEL_ID_ALERTS = "involvex-alerts";

type PushNotificationModule = {
  createChannel: (
    channel: {
      channelId: string;
      channelName: string;
      channelDescription?: string;
      importance?: number;
      vibrate?: boolean;
    },
    onCreated?: (created: boolean) => void,
  ) => void;
  configure: (options: Record<string, unknown>) => void;
};

function loadPushNotification(): PushNotificationModule | null {
  try {
    // Optional dependency - never let a missing native module break startup.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-push-notification");
  } catch (error) {
    console.warn("react-native-push-notification unavailable:", error);
    return null;
  }
}

/**
 * Create the notification channels used by the app.
 * Safe to call repeatedly; the library ignores duplicate channel ids.
 */
export function createNotificationChannels(): void {
  if (Platform.OS !== "android") return;

  const push = loadPushNotification();
  if (!push) return;

  const channels = [
    {
      channelId: NOTIFICATION_CHANNEL_ID,
      channelName: "General",
      channelDescription: "Release alerts and subscription updates",
      importance: 4,
      vibrate: true,
    },
    {
      channelId: NOTIFICATION_CHANNEL_ID_ALERTS,
      channelName: "Trending & Digests",
      channelDescription: "Daily digest, weekly summary and trending alerts",
      importance: 3,
      vibrate: false,
    },
  ];

  for (const channel of channels) {
    try {
      push.createChannel(channel, (created) => {
        if (created) {
          console.log("Notification channel created:", channel.channelId);
        }
      });
    } catch (error) {
      console.warn("Failed to create channel", channel.channelId, error);
    }
  }
}

/**
 * Request POST_NOTIFICATIONS (Android 13+).
 * Returns true when notifications may be shown.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  // Channels are required from Android 8 onwards, independent of the runtime
  // permission, so create them regardless of the prompt outcome.
  createNotificationChannels();

  // Below Android 13 notifications need no runtime grant.
  if (typeof Platform.Version === "number" && Platform.Version < 33) {
    return true;
  }

  try {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (alreadyGranted) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn("Notification permission request failed:", error);
    return false;
  }
}

/** Whether notifications are currently allowed. */
export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  if (typeof Platform.Version === "number" && Platform.Version < 33) {
    return true;
  }

  try {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  } catch {
    return false;
  }
}

/**
 * Prompt for notifications. Only ask when the user has opted in via settings,
 * otherwise Android may auto-deny on repeated requests.
 */
export async function ensurePermissionsForOptIn(
  enabled: boolean,
): Promise<boolean> {
  if (!enabled) return false;
  return requestNotificationPermission();
}
