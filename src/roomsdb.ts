import WebSocket from "ws";
import players from "./playersdb";

export const rooms = new Map<string, { users: WebSocket[] }>();
export const playerInfo = new Map<WebSocket, { name: string; index: string }>();

function generateRoomId(): string {
  return `room_${Math.floor(Math.random() * 100000)}_${Date.now()}`;
}

export function createRoom(ws: WebSocket) {
  const roomId = generateRoomId();
  rooms.set(roomId, { users: [ws] });

  console.log(rooms);

  ws.send(
    JSON.stringify({
      type: "create_room",
      data: JSON.stringify({
        roomId,
        message: "Комната создана, и вы в ней находитесь.",
      }),
      id: 0,
    }),
  );

  notifyRoomUpdate();
}

export function getRoomsList() {
  return Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    roomUsers: room.users.map((ws) => {
      const info = playerInfo.get(ws);
      return info
        ? { name: info.name, index: info.index }
        : { name: "Unknown", index: "Unknown" };
    }),
  }));
}

export function notifyRoomUpdate() {
  const roomData = JSON.stringify({
    type: "update_room",
    data: JSON.stringify(getRoomsList()),
    id: 0,
  });

  console.log(roomData);

  players.forEach(({ ws }) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(roomData);
    }
  });
}
