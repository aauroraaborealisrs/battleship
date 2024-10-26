import handleRegistration from "./handleRegistration";

export function handleMessage(ws: WebSocket, message: any) {
  switch (message.type) {
    case "reg":
      handleRegistration(ws, message.data);
      break;
    default:
      ws.send(JSON.stringify({ error: "Unknown command type" }));
  }
}
