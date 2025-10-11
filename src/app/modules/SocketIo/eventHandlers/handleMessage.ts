import prisma from "../../../../shared/prisma";
import { ExtendedSocket } from "../types";
import { userSockets } from "./authenticate";

export async function handleMessage(socket: ExtendedSocket, data: any) {
  try {
    const { receiverId: receiver, message, type } = data;

    if (!socket.userId || !message) {
      socket.emit("error", { message: "Invalid message payload." });
      return;
    }

    let receiverId = receiver;

    if (type === "ADMIN") {
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      receiverId = admin?.id;
    }

    const receiverUser = await prisma.user.findFirst({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiverUser) {
      socket.emit("socketError", { message: "Receiver not found." });
      return;
    }

    let room = await prisma.room.findFirst({
      where: {
        OR: [
          { senderId: socket.userId, receiverId },
          { senderId: receiverId, receiverId: socket.userId },
        ],
      },
    });

    if (!room) {
      room = await prisma.room.create({
        data: { senderId: socket.userId, receiverId },
      });
    }

    const chat = await prisma.chat.create({
      data: {
        senderId: socket.userId,
        receiverId,
        roomId: room.id,
        message,
      },
    });

    // Emit to both users
    const receiverSocket = userSockets.get(receiverId);
    if (receiverSocket) {
      receiverSocket.emit("message", chat);
    }

    socket.emit("message", chat);
  } catch (err: any) {
    console.error("Error handling message:", err);
    socket.emit("socketError", {
      code: "SERVER_ERROR",
      message: "Failed to send message.",
      error: err?.meta?.message || err?.message || "Unknown error",
    });
  }
}
