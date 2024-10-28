import { createRoom } from "../roomsdb";
import { addShips2 } from "./addShips2";
import handleAttack from "./attack";
import handleRegistration from "./registration";

export function handleBotMessage(ws: WebSocket, message: any) {
  console.log(`Client ${message.type}`);
  switch (message.type) {
    case "create_room":
      createRoom(ws);
      break;
    case "reg":
      handleRegistration(ws, message.data);
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
        console.log("Server error");
        return;
      }

      const { gameId, ships, indexPlayer } = shipData;
      addShips2(gameId, ships, indexPlayer, ws);
      break;

    case "attack":
      let attackData;
      try {
        attackData =
          typeof message.data === "string"
            ? JSON.parse(message.data)
            : message.data;
      } catch (error) {
        console.error("Error parsing attack data:", error);
        ws.send(JSON.stringify({ error: "Invalid data format" }));
        return;
      }

      const {
        gameId: attackGameId,
        x,
        y,
        indexPlayer: attackingPlayer,
      } = attackData;
      handleAttack(attackGameId, x, y, attackingPlayer, ws);
      break;

    default:
      ws.send(
        JSON.stringify({ error: `Unknown command type ${message.type}` }),
      );
      console.log("Server error");
  }
}
