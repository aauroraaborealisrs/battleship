import { notifyRoomUpdate, rooms } from "../roomsdb";

export function addUserToRoom(roomId: string, ws: WebSocket) {
  const room = rooms.get(roomId);
  console.log(room);
  console.log(roomId);
  console.log(rooms);

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
    const gameId = `game_${Math.floor(Math.random() * 100000)}`;

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
