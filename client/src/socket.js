import { io } from "socket.io-client";

const URI = import.meta.env.VITE_BACKEND_URI;
export const socket = io(URI, { withCredentials: true });
