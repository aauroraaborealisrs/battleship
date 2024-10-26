import { createRoom } from "../roomsdb";
import { addShips } from "./addShips";
import { addUserToRoom } from "./addUserToRoom";
import handleRegistration from "./registration";

export function handleMessage(ws: WebSocket, message: any) {
  switch (message.type) {
    case "reg":
      handleRegistration(ws, message.data);
      break;
    case "create_room":
      createRoom(ws);
      break;
    case "add_user_to_room":
      let data;
      try {
        data =
          typeof message.data === "string"
            ? JSON.parse(message.data)
            : message.data;
      } catch (error) {
        console.error("Error parsing message data:", error);
        ws.send(JSON.stringify({ error: "Invalid data format" }));
        return;
      }
      addUserToRoom(data.indexRoom, ws);
      break;

    case "add_ships":
      let shipData;
      try {
        shipData =
          typeof message.data === "string"
            ? JSON.parse(message.data)
            : message.data;
      } catch (error) {
        console.error("Error parsing message data:", error);
        ws.send(JSON.stringify({ error: "Invalid data format" }));
        return;
      }

      const { gameId, ships, indexPlayer } = shipData;
      console.log(gameId, indexPlayer);
      addShips(gameId, ships, indexPlayer, ws);
      break;
    default:
      ws.send(JSON.stringify({ error: "Unknown command type" }));
  }
}
