import axios from "axios";
import Constants from "expo-constants";

const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "http://localhost:5000";

const API = axios.create({
  baseURL: configuredBaseUrl,
  timeout: 15000,
});

export const setAuthToken = (token) => {
  API.defaults.headers.common.Authorization = token ? `Bearer ${token}` : "";
};

export default API;
