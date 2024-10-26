import { WebSocketServer } from "ws";
import { httpServer } from "./src/http_server";
import { handleMessage } from "./src/handlers/handleMessage";

const HTTP_PORT = 3000;
export const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Message received:", message);
      handleMessage(ws, message);
    } catch (error) {
      console.error("Message parsing error:", error);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

export const terminateServer = () => {
  console.log("Initiating server termination...");
  wss.clients.forEach((client) => client.readyState === client.OPEN && client.close());
  wss.close(() => {
    console.log("WebSocket server successfully terminated.");
    process.exit(0);
  });
};

process.on("SIGINT", terminateServer);
process.on("SIGTERM", terminateServer);

httpServer.listen(HTTP_PORT, () => {
  console.log(`Server is running at http://localhost:${HTTP_PORT}`);
});
