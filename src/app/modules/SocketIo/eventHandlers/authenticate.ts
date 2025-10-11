import config from "../../../../config";
import { jwtHelpers } from "../../../../helpers/jwtHelpers";
import prisma from "../../../../shared/prisma";
import { ExtendedSocket } from "../types";
import { Server } from "socket.io";

const onlineUsers = new Set<string>();
export const userSockets = new Map<string, ExtendedSocket>();

export async function handleAuthenticate(
  socket: ExtendedSocket,
  data: any,
  io: Server
) {
  const token = data.token;

  if (!token) {
    socket.emit("socketError", {
      message: "Authentication token not provided.",
    });
    socket.disconnect(true);
    return;
  }

  try {
    const user = jwtHelpers.verifyToken(token, config.jwt.jwt_secret!);
    if (!user) {
      socket.emit("socketError", { message: "Invalid or expired token." });
      socket.disconnect(true);
      return;
    }

    const userData = await prisma.user.findFirst({
      where: { id: user.id },
    });

    if (!userData) {
      socket.emit("socketError", { message: "User not found." });
      socket.disconnect(true);
      return;
    }

    socket.userId = user.id;
    onlineUsers.add(user.id);
    userSockets.set(user.id, socket);

    io.emit("userStatus", {
      userId: user.id,
      isOnline: true,
    });

    socket.emit("authenticate", {
      message: "Authentication successful.",
      userId: user.id,
    });
  } catch (err) {
    console.error("Authentication error:", err);
    socket.disconnect(true);
  }
}
