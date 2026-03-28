import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import API from "../services/api";

export async function registerPushToken() {
  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return null;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  await API.post("/notifications/device-token", {
    token,
    platform: Platform.OS === "ios" ? "ios" : "android",
  });

  return token;
}
