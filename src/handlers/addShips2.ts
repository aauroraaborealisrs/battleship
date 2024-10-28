import { games } from "./addShips";

export function addShips2(
  gameId: string,
  ships: any[],
  indexPlayer: string,
  ws: WebSocket,
) {
  const game = games.get(gameId);

  if (!game) {
    console.error(`Game with ID ${gameId} not found.`);
    return;
  }

  const player = game.players.find((p) => p.id === indexPlayer);
  if (player) {
    player.ships = ships;
    console.log(`Ships added for player ${indexPlayer} in game ${gameId}`);
  } else {
    console.error(`Player with ID ${indexPlayer} not found in game ${gameId}`);
    return;
  }

  if (game.players.every((p) => p.ships && p.ships.length > 0)) {
    console.log("Both players have added ships. Starting game...");
    startGame(gameId);
  } else {
    console.log("Waiting for both players to add ships.");
  }
}

function startGame(gameId: string) {
  const game = games.get(gameId);
  if (!game) {
    console.error(`Game with ID ${gameId} not found.`);
    return;
  }

  game.currentTurn = game.players[0].id;

  game.players.forEach((player) => {
    player.ships = normalizeShips(player.ships);

    console.log("ships", player.ships);

    player.ws.send(
      JSON.stringify({
        type: "start_game",
        data: JSON.stringify({
          ships: player.ships,
          currentPlayerIndex: game.currentTurn,
        }),
        id: 0,
      }),
    );
  });
}

function normalizeShips(ships: any[]): any[] {
  return ships.map((ship) => {
    if (ship.position) {
      return ship;
    } else {
      const { x, y, ...rest } = ship;
      return { position: { x, y }, ...rest };
    }
  });
}
