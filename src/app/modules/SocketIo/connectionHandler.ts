import { Server } from "socket.io";
import { handleAuthenticate } from "./eventHandlers/authenticate";
import { handleFetchChats } from "./eventHandlers/handleFetchChats";
import { handleMessage } from "./eventHandlers/handleMessage";
import { handleMessageList } from "./eventHandlers/handleMessageList";
import { myAdminChats } from "./eventHandlers/myAdminChats";
import { ExtendedSocket } from "./types";

export function handleConnection(socket: ExtendedSocket, io: Server) {
  console.log("Client connected:", socket.id);

  socket.onAny((event, data) => {
    console.log("📩 Received event:", event, data);
  });

  socket.on("authenticate", async (data) => {
    await handleAuthenticate(socket, data, io);
  });

  socket.on("message", async (data) => {
    await handleMessage(socket, data);
  });

  socket.on("fetchChats", async (data) => {
    await handleFetchChats(socket, data);
  });

  socket.on("myAdminChats", async (data) => {
    await myAdminChats(socket, data);
  });

  socket.on("messageList", async () => {
    await handleMessageList(socket);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    if (socket.userId) {
      // handle cleanup if needed
    }
  });
}
