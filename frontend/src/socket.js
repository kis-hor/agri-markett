import { io } from "socket.io-client";
import { server } from "./server";

const socket_url = server;

export const socket = io(socket_url, {
  withCredentials: true,
  transports: ["websocket"],
}); 