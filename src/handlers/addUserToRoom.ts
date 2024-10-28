import { notifyRoomUpdate, rooms } from "../roomsdb";
import { games } from "./addShips";

export const activeGames = new Map<
  string,
  { player1: string; player2: string }
>();

export function addUserToRoom(roomId: string, ws: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) {
    console.log("Server eror");

    ws.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({ message: "Комната не найдена." }),
        id: 0,
      }),
    );
    return;
  }

  const isAlreadyInRoom = room.users.some((user) => user === ws);
  if (isAlreadyInRoom) {
    console.log("Server eror");

    ws.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({ message: "Вы уже в этой комнате." }),
        id: 0,
      }),
    );
    return;
  }

  room.users.push(ws);

  if (room.users.length === 2) {
    const gameId = `game_${roomId.split("_")[1]}`;
    const player1Name = room.users[0].username;
    const player2Name = room.users[1].username;

    activeGames.set(gameId, { player1: player1Name, player2: player2Name });

    let game = games.get(gameId);
    if (game) {
      game.players.push({ id: "player_2", ws, ships: [], hits: [] });
    } else {
      game = {
        players: [
          { id: "player_1", ws: room.users[0], ships: [], hits: [] },
          { id: "player_2", ws, ships: [], hits: [] },
        ],
        currentTurn: "player_1",
      };
      games.set(gameId, game);
    }

    room.users.forEach((user, index) => {
      console.log("Server create_game");

      user.send(
        JSON.stringify({
          type: "create_game",
          data: JSON.stringify({
            idGame: gameId,
            idPlayer: `player_${index + 1}`,
          }),
          id: 0,
        }),
      );
    });

    rooms.delete(roomId);
  }

  notifyRoomUpdate();
}
