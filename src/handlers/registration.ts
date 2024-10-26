import { WebSocket } from "ws";
import { addPlayer, playerExists } from "../playersdb";
import { updateWinners } from "../utils/updateWinners";
import { playerInfo } from "../roomsdb";

export default function handleRegistration(
  ws: WebSocket,
  data: { name: string; password: string } | string,
) {
  console.log("Получены данные для регистрации:", data);

  if (typeof data === "string") {
    data = JSON.parse(data) as { name: string; password: string };
  }

  if (typeof data === "object" && "name" in data && "password" in data) {
    const { name, password } = data;

    if (!name || !password) {
      ws.send(
        JSON.stringify({
          type: "reg",
          data: JSON.stringify({
            name: "",
            index: "",
            error: true,
            errorText: "Invalid input data",
          }),
          id: 0,
        }),
      );
      return;
    }

    if (playerExists(name)) {
      ws.send(
        JSON.stringify({
          type: "reg",
          data: JSON.stringify({
            name,
            index: "",
            error: true,
            errorText: "Player already exists",
          }),
          id: 0,
        }),
      );
      return;
    }

    addPlayer(name, password, ws);

    const index = `player_${Math.floor(Math.random() * 100000)}`;
    playerInfo.set(ws, { name, index });
    console.log(`Игрок ${name} успешно зарегистрирован.`);

    ws.send(
      JSON.stringify({
        type: "reg",
        data: JSON.stringify({
          name,
          index: name,
          error: false,
          errorText: "",
        }),
        id: 0,
      }),
    );

    updateWinners();
  } else {
    ws.send(
      JSON.stringify({
        type: "reg",
        data: JSON.stringify({
          name: "",
          index: "",
          error: true,
          errorText: "Invalid data format",
        }),
        id: 0,
      }),
    );
  }
}
