import prisma from "../../../../shared/prisma";
import { ExtendedSocket } from "../types";

const onlineUsers = new Set<string>();

export async function handleMessageList(socket: ExtendedSocket) {

  try {
    if (!socket.userId) {
      socket.emit("socketError", { message: "User not authenticated." });
      return;
    }

    // Fetch all rooms where the user is involved
    const rooms = await prisma.room.findMany({
      where: {
        OR: [{ senderId: socket.userId }, { receiverId: socket.userId }],
      },
      include: {
        chat: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Extract the relevant user IDs from the rooms
    const userIds = rooms.map((room) =>
      room.senderId === socket.userId ? room.receiverId : room.senderId
    );

    if (!userIds.length) {
      socket.emit("messageList", { data: [] });
      return;
    }

    // Fetch users for those IDs
    const userInfos = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        image: true,
      },
    });

    // Combine user info with last message and online status
    const userWithLastMessages = rooms.map((room) => {
      const otherUserId =
        room.senderId === socket.userId ? room.receiverId : room.senderId;

      const userInfo = userInfos.find((u) => u.id === otherUserId);

      return {
        user: userInfo || null,
        lastMessage: room.chat[0] || null,
        isOnline: onlineUsers.has(userInfo?.id || ""),
      };
    });

    // Send success response back to the client
    socket.emit("messageList", {
      data: userWithLastMessages,
    });
  } catch (error: any) {
    console.error("Error fetching user list with last messages:", error);

    socket.emit("socketError", {
      code: "SERVER_ERROR",
      message: "Failed to send message.",
      error: error?.meta?.message || error?.message || "Unknown error",
    });
  }
}
