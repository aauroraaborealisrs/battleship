import { WebSocket } from "ws";
import { addPlayer, getPlayersList, playerExists } from "../playersdb";

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
    console.log(`Игрок ${name} успешно зарегистрирован.`);
    console.log("Текущие игроки:", getPlayersList());

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
