import * as Location from "expo-location";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export async function captureCurrentLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Location permission denied");
  }

  const position = await Location.getCurrentPositionAsync({});
  return `${position.coords.latitude},${position.coords.longitude}`;
}

export async function recordEmergencyAudio(seconds = 30) {
  const audioPermission = await Audio.requestPermissionsAsync();
  if (audioPermission.status !== "granted") {
    throw new Error("Microphone permission denied");
  }

  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();

  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

  return { uri, base64 };
}
