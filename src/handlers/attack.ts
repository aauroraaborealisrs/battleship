import { getPlayersList } from "../playersdb";
import { updateWinner } from "../utils/updateWinner";
import { games } from "./addShips";
import { activeGames } from "./addUserToRoom";
import { mockWebSocket } from "./initializeSinglePlayerGame";
import markSurroundingCellsAsShot from "./markSurroundingCellsAsShot";

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

function normalizeShips(ships: any[]): Ship[] {
  return ships.map((ship) => ({
    position: { x: ship.position?.x ?? 0, y: ship.position?.y ?? 0 },
    direction: ship.direction ?? true,
    length: ship.length ?? 1,
    type: ship.type ?? "small",
  }));
}

export const attackedCoordinatesMap = new Map<string, Set<string>>();

export function markAttack(gameId: string, x: number, y: number) {
  if (!attackedCoordinatesMap.has(gameId)) {
    attackedCoordinatesMap.set(gameId, new Set());
  }
  attackedCoordinatesMap.get(gameId)!.add(`${x},${y}`);
}

export function getRandomAttackCoordinate(gameId: string): {
  x: number;
  y: number;
} {
  let x, y;
  do {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
  } while (attackedCoordinatesMap.get(gameId)?.has(`${x},${y}`));

  return { x, y };
}

export function handleRandomAttack(
  gameId: string,
  indexPlayer: string,
  ws: WebSocket,
) {
  const { x, y } = getRandomAttackCoordinate(gameId);
  markAttack(gameId, x, y);
  handleAttack(gameId, x, y, indexPlayer, ws);
}

export default function handleAttack(
  gameId: string,
  x: number,
  y: number,
  indexPlayer: string,
  ws: WebSocket,
) {
  const game = games.get(gameId);
  if (!game) {
    ws.send(JSON.stringify({ error: "Game not found", id: 0 }));
    console.log("Server error");

    return;
  }

  if (game.currentTurn !== indexPlayer) {
    ws.send(JSON.stringify({ error: "Not your turn", id: 0 }));
    console.log("Server error");

    return;
  }

  markAttack(gameId, x, y);

  const enemy = game.players.find((p) => p.id !== indexPlayer);
  if (!enemy) {
    return;
  }

  const ships: Ship[] = normalizeShips(enemy.ships);
  let status: "miss" | "shot" | "killed" = "miss";

  for (const ship of ships) {
    const { x: startX, y: startY } = ship.position;

    const isVertical = ship.direction;
    let hit = false;

    for (let i = 0; i < ship.length; i++) {
      const shipX = isVertical ? startX : startX + i;
      const shipY = isVertical ? startY + i : startY;

      if (shipX === x && shipY === y) {
        hit = true;
        status = "shot";

        enemy.hits.push({ x: shipX, y: shipY });

        const allSegmentsHit = Array.from({ length: ship.length }, (_, j) => ({
          x: isVertical ? startX : startX + j,
          y: isVertical ? startY + j : startY,
        })).every((segment) =>
          enemy.hits.some(
            (hitCoord) => hitCoord.x === segment.x && hitCoord.y === segment.y,
          ),
        );

        if (allSegmentsHit) {
          status = "killed";

          for (let i = 0; i < ship.length; i++) {
            const killedX = isVertical ? startX : startX + i;
            const killedY = isVertical ? startY + i : startY;

            game.players.forEach((player) => {
              console.log("Server attack");

              player.ws.send(
                JSON.stringify({
                  type: "attack",
                  data: JSON.stringify({
                    position: { x: killedX, y: killedY },
                    currentPlayer: indexPlayer,
                    status: "killed",
                  }),
                  id: 0,
                }),
              );
            });
          }
          markSurroundingCellsAsShot(ship, game, indexPlayer);
        } else {
          game.players.forEach((player) => {
            console.log("Server attack");
            player.ws.send(
              JSON.stringify({
                type: "attack",
                data: JSON.stringify({
                  position: { x, y },
                  currentPlayer: indexPlayer,
                  status: status,
                }),
                id: 0,
              }),
            );
          });
        }

        break;
      }
    }

    if (hit) break;
  }

  const allShipsDestroyed = ships.every((ship) =>
    Array.from({ length: ship.length }, (_, j) => ({
      x: ship.direction ? ship.position.x : ship.position.x + j,
      y: ship.direction ? ship.position.y + j : ship.position.y,
    })).every((segment) =>
      enemy.hits.some(
        (hitCoord) => hitCoord.x === segment.x && hitCoord.y === segment.y,
      ),
    ),
  );

  if (allShipsDestroyed) {
    updateWinner(gameId, indexPlayer);

    game.players.forEach((player) => {
      console.log("Server finish");

      player.ws.send(
        JSON.stringify({
          type: "finish",
          data: JSON.stringify({
            winPlayer: indexPlayer,
          }),
          id: 0,
        }),
      );
    });
    games.delete(gameId);
    activeGames.delete(gameId);
    return;
  }

  game.players.forEach((player) => {
    console.log("Server attack");

    player.ws.send(
      JSON.stringify({
        type: "attack",
        data: JSON.stringify({
          position: { x, y },
          currentPlayer: indexPlayer,
          status,
        }),
        id: 0,
      }),
    );
  });

  if (status === "miss") {
    game.currentTurn = enemy.id;
  }

  game.players.forEach((player) => {
    console.log("Server turn");
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

  if (
    game.currentTurn === "player_2" &&
    activeGames.get(gameId)?.player2 === "Bot"
  ) {
    setTimeout(
      () => handleRandomAttack(gameId, "player_2", mockWebSocket),
      500,
    );
  }
}
