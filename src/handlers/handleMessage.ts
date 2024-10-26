import { addUserToRoom, createRoom } from "../roomsdb";
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
      if (message.data && message.data.indexRoom) {
        addUserToRoom(message.data.indexRoom, ws);
      } else {
        ws.send(JSON.stringify({ error: "Invalid room ID" }));
      }
      break;
    default:
      ws.send(JSON.stringify({ error: "Unknown command type" }));
  }
}
