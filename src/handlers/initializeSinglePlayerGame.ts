import { addPlayer } from "../playersdb";
import { games } from "./addShips";
import { activeGames } from "./addUserToRoom";
import generateRandomShips from "./generateRandomShips";

export const mockWebSocket = {
  send: (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      console.log(`Server: ${parsedData.type}`);
    } catch (error) {
      console.log("Server: invalid data format");
    }
  },
  close: () => console.log("Server closed"),
} as WebSocket;

export default function initializeGameWithBot(ws: WebSocket, username: string) {
  const gameId = `game_${Math.floor(Math.random() * 100000)}`;

  const botPlayer = {
    id: "player_2",
    ws: mockWebSocket,
    ships: generateRandomShips(),
    hits: [],
  };

  addPlayer("Bot", "", mockWebSocket);

  const userPlayer = {
    id: "player_1",
    ws,
    ships: [],
    hits: [],
  };

  games.set(gameId, {
    players: [userPlayer, botPlayer],
    currentTurn: "player_1",
  });

  activeGames.set(gameId, { player1: username, player2: "Bot" });

  ws.send(
    JSON.stringify({
      type: "create_game",
      data: JSON.stringify({
        idGame: gameId,
        idPlayer: "player_1",
      }),
      id: 0,
    }),
  );
}
