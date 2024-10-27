
import { games } from "./addShips";

export default function handleAttack(gameId: string, x: number, y: number, indexPlayer: string, ws: WebSocket) {
    const game = games.get(gameId);
    if (!game) {
      ws.send(JSON.stringify({ error: "Game not found", id: 0 }));
      return;
    }
  
    if (game.currentTurn !== indexPlayer) {
      ws.send(JSON.stringify({ error: "Not your turn", id: 0 }));
      return;
    }
  
    const enemy = game.players.find((p) => p.id !== indexPlayer);
    if (!enemy) return;
  
    let status: "miss" | "shot" | "killed" = "miss";
  
    for (const ship of enemy.ships) {
      const hit = ship.x === x && ship.y === y;
      if (hit) {
        status = "shot";
        break;
      }
    }
  
    game.currentTurn = enemy.id;
  
    game.players.forEach((player) => {
      player.ws.send(JSON.stringify({
        type: "attack",
        data: JSON.stringify({
          position: { x, y },
          currentPlayer: indexPlayer,
          status
        }),
        id: 0
      }));
    });
  
    game.players.forEach((player) => {
      player.ws.send(JSON.stringify({
        type: "turn",
        data: JSON.stringify({
          currentPlayer: game.currentTurn,
        }),
        id: 0
      }));
    });
  }
  