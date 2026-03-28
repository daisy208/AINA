import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import API from "../services/api";
import { buildReplayHeaders } from "./requestSecurity";

const INCIDENT_QUEUE_KEY = "aina_incident_queue_v1";
const SOS_QUEUE_KEY = "aina_sos_queue_v1";

async function pushToQueue(key, payload) {
  const existing = JSON.parse((await AsyncStorage.getItem(key)) || "[]");
  existing.push({ ...payload, queuedAt: new Date().toISOString() });
  await AsyncStorage.setItem(key, JSON.stringify(existing));
}

export async function enqueueIncident(payload) {
  await pushToQueue(INCIDENT_QUEUE_KEY, payload);
}

export async function enqueueSOS(payload) {
  await pushToQueue(SOS_QUEUE_KEY, payload);
}

async function flushQueue(key, endpoint) {
  const items = JSON.parse((await AsyncStorage.getItem(key)) || "[]");
  const pending = [];

  for (const item of items) {
    try {
      const headers = await buildReplayHeaders();
      await API.post(endpoint, item, { headers });
    } catch {
      pending.push(item);
    }
  }

  await AsyncStorage.setItem(key, JSON.stringify(pending));
}

export async function syncOfflineQueues() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  await flushQueue(INCIDENT_QUEUE_KEY, "/incident");
  await flushQueue(SOS_QUEUE_KEY, "/sos/trigger");
}
