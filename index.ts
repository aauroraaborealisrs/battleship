import { WebSocketServer } from "ws";
import { httpServer } from "./src/http_server";
import { handleMessage } from "./src/handlers/handleMessage";
import players, { getPlayersList } from "./src/playersdb";
import { updateWinners } from "./src/utils/updateWinners";
import { notifyRoomUpdate, rooms } from "./src/roomsdb";
import { activeGames } from "./src/handlers/addUserToRoom";
import { games } from "./src/handlers/addShips";
import { updateWinner } from "./src/utils/updateWinner";
import initializeSinglePlayerGame from "./src/handlers/initializeSinglePlayerGame";
import { handleBotMessage } from "./src/handlers/handleBotMessage";

const HTTP_PORT = 3000;
export const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
  
      
      const isBotGame = Array.from(activeGames.values()).some(
        (game) => game.player2 === "Bot" || game.player1 === "Bot"
      );
  
      if (message.type === "single_play" && !message.data) {
        initializeSinglePlayerGame(ws, "Bot");
      } else if (!isBotGame) {
        handleMessage(ws, message);
      } else {
        handleBotMessage(ws, message);

      }
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
      players.delete(playerName);
      updateWinners();

      for (const [roomId, roomData] of rooms.entries()) {
        const index = roomData.users.indexOf(ws);
        if (index !== -1) {
          roomData.users.splice(index, 1);
          
          if (roomData.users.length === 0) {
            rooms.delete(roomId);
          }
        }
      }

      for (const [gameId, gameData] of activeGames.entries()) {

        if (gameData.player1 === playerName || gameData.player2 === playerName) {
          const remainingPlayerId = gameData.player1 === playerName ? "player_2" : "player_1";
          const remainingPlayerName = remainingPlayerId === "player_1" ? gameData.player1 : gameData.player2;
          
          
          const remainingPlayerData = players.get(remainingPlayerName);
          updateWinner(gameId, remainingPlayerId);
      
          if (remainingPlayerData) {
            console.log('Server finish');
            remainingPlayerData.ws.send(
              JSON.stringify({
                type: "finish",
                data: JSON.stringify({
                  winPlayer: remainingPlayerId,
                }),
                id: 0,
              })
            );
          }

  
          activeGames.delete(gameId);
          games.delete(gameId);
        }
      }
      
      notifyRoomUpdate();
    }
  });
  
});

export const terminateServer = () => {
  console.log("Server: termination");
  wss.clients.forEach((client) => client.readyState === client.OPEN && client.close());
  wss.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", terminateServer);
process.on("SIGTERM", terminateServer);

httpServer.listen(HTTP_PORT, () => {
  console.log(`Server is running at http://localhost:${HTTP_PORT}`);
});
