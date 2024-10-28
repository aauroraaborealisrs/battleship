import { games } from "./addShips";
import handleAttack from "./attack";

const attackedCoordinates = new Set<string>();

function performRandomAttack(
  gameId: string,
  indexPlayer: string,
  ws: WebSocket,
) {
  const game = games.get(gameId);
  if (!game) {
    ws.send(JSON.stringify({ error: "Game not found", id: 0 }));
    return;
  }

  let x, y;
  do {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
  } while (attackedCoordinates.has(`${x},${y}`));

  attackedCoordinates.add(`${x},${y}`);
  handleAttack(gameId, x, y, indexPlayer, ws);

  game.players.forEach((player) => {
    player.ws.send(
      JSON.stringify({
        type: "turn",
        data: JSON.stringify({
          currentPlayer: game.currentTurn,
        }),
        id: 0,
      }),
    );
  });
}
