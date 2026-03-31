import { io } from "socket.io-client";
import API from "./api";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(API.defaults.baseURL, {
      transports: ["websocket"],
    });
  }
  return socket;
}
