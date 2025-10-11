import { Socket } from "socket.io";

export interface ExtendedSocket extends Socket {
  userId?: string;
}

export type SocketEvent =
  | "authenticate"
  | "message"
  | "fetchChats"
  | "unReadMessages"
  | "messageList"
  | "userStatus"
  | "myAdminChats"
  | "messageToTrainer"
  | "messageToNutritionist"
  | "adminMessageList";
