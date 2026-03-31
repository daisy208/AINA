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

export const extractErrorMessage = (error, fallback = "Something went wrong") => error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;

export const setAuthToken = (token) => {
  API.defaults.headers.common.Authorization = token ? `Bearer ${token}` : "";
};

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken("");
    }
    return Promise.reject(error);
  }
);

export default API;
