import prisma from "../../../../shared/prisma";
import { ExtendedSocket } from "../types";

const onlineUsers = new Set<string>();

export async function handleFetchChats(socket: ExtendedSocket, data: any) {
  try {
    const { receiverId } = data;

    if (!socket.userId) {
      socket.emit("socketError", { message: "User not authenticated." });
      return;
    }

    if (!receiverId) {
      socket.emit("socketError", { message: "Receiver ID is required." });
      return;
    }

    const room = await prisma.room.findFirst({
      where: {
        OR: [
          { senderId: socket.userId, receiverId },
          { senderId: receiverId, receiverId: socket.userId },
        ],
      },
    });

    if (!room) {
      socket.emit("fetchChats", {
        data: [],
        online: onlineUsers.has(receiverId),
      });
      return;
    }

    const chats = await prisma.chat.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        message: true,
        createdAt: true,
        receiverId: true,
        senderId: true,
        isRead: true,
        receiver: {
          select: {
            image: true,
          },
        },
        sender: {
          select: {
            image: true,
          },
        },
      },
    });

    await prisma.chat.updateMany({
      where: { roomId: room.id, receiverId: socket.userId },
      data: { isRead: true },
    });

    socket.emit("fetchChats", {
      data: chats,
      online: onlineUsers.has(receiverId),
    });
  } catch (error: any) {
    console.error("Error fetching chats:", error);

    socket.emit("socketError", {
      code: "SERVER_ERROR",
      message: "Failed to fetch chat messages.",
      error: error?.meta?.message || error?.message || "Unknown error",
    });
  }
}
