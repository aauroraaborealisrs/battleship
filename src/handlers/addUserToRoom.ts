import { notifyRoomUpdate, rooms } from "../roomsdb";
import { games } from "./addShips";

export function addUserToRoom(roomId: string, ws: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({
          message: "Комната не найдена.",
        }),
        id: 0,
      }),
    );
    return;
  }

  room.users.push(ws);

  if (room.users.length === 2) {
    const gameId = `game_${roomId.split("_")[1]}`;
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
