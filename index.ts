import { WebSocketServer } from "ws";
import { httpServer } from "./src/http_server";
import { handleMessage } from "./src/handlers/handleMessage";
import players, { getPlayersList } from "./src/playersdb";
import { updateWinners } from "./src/utils/updateWinners";
import { notifyRoomUpdate, rooms } from "./src/roomsdb";

const HTTP_PORT = 3000;
export const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Message received:", message);
      handleMessage(ws, message);
    } catch (error) {
      console.error("Message parsing error:", error);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    const playerEntry = Array.from(players.entries()).find(
      ([, playerData]) => playerData.ws === ws
    );
  
    if (playerEntry) {
      const [playerName] = playerEntry;
      console.log(`Client ${playerName} disconnected`);
      
      players.delete(playerName);
      console.log(getPlayersList());
      updateWinners();

      for (const [roomId, roomData] of rooms.entries()) {
        const index = roomData.users.indexOf(ws);
        if (index !== -1) {
          roomData.users.splice(index, 1);
          console.log(`Removed disconnected user from room ${roomId}`);
          
          if (roomData.users.length === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted as it is empty`);
          }
        }
      }

      notifyRoomUpdate();
    }
  });
  
});

export const terminateServer = () => {
  console.log("Initiating server termination...");
  wss.clients.forEach((client) => client.readyState === client.OPEN && client.close());
  wss.close(() => {
    console.log("WebSocket server successfully terminated.");
    process.exit(0);
  });
};

process.on("SIGINT", terminateServer);
process.on("SIGTERM", terminateServer);

httpServer.listen(HTTP_PORT, () => {
  console.log(`Server is running at http://localhost:${HTTP_PORT}`);
});
