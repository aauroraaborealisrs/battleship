import { notifyRoomUpdate, rooms } from "../roomsdb";
import { games } from "./addShips";

export const activeGames = new Map<
  string,
  { player1: string; player2: string }
>();

export function addUserToRoom(roomId: string, ws: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({ message: "Комната не найдена." }),
        id: 0,
      }),
    );
    return;
  }

  room.users.push(ws);

  console.log(`room.users: ${JSON.stringify(room.users)}`);

  if (room.users.length === 2) {
    const gameId = `game_${roomId.split("_")[1]}`;
    const player1Name = room.users[0].username;
    const player2Name = room.users[1].username;

    console.log(`room.users[0]: ${JSON.stringify(room.users[0])}`);
    console.log(`room.users[0].name: ${JSON.stringify(room.users[0].name)}`);

    console.log(`Game ID: ${gameId}`);
    console.log(`Player 1 Name: ${player1Name}`);
    console.log(`Player 2 Name: ${player2Name}`);

    activeGames.set(gameId, { player1: player1Name, player2: player2Name });

    console.log(`activeGames ${JSON.stringify(activeGames)}`);
    console.log(
      `After setting, activeGames: ${JSON.stringify(Array.from(activeGames.entries()))}`,
    );

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
