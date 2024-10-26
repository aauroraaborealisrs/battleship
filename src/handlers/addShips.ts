export const games = new Map<
  string,
  {
    players: {
      id: string;
      ws: WebSocket;
      ships: { x: number; y: number; direction: boolean; length: number }[];
      hits: { x: number; y: number }[];
    }[];
    currentTurn: string;
  }
>();

export function addShips(
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
    player.ws.send(
      JSON.stringify({
        type: "start_game",
        data: {
          ships: player.ships,
          currentPlayerIndex: game.currentTurn,
        },
        id: 0,
      }),
    );
  });
}
