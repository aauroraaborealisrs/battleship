import { getPlayersList } from "../playersdb";
import { updateWinner } from "../utils/updateWinner";
import { games } from "./addShips";
import { activeGames } from "./addUserToRoom";
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
  console.log(
    `Attacked cells for ${gameId}:`,
    JSON.stringify(Array.from(attackedCoordinatesMap.get(gameId)!)),
  );
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

  console.log(`Random attack coordinate selected: x ${x}, y ${y}`);
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
    console.log(`[Error] Game with ID ${gameId} not found.`);
    ws.send(JSON.stringify({ error: "Game not found", id: 0 }));
    return;
  }

  if (game.currentTurn !== indexPlayer) {
    console.log(`[Info] Not ${indexPlayer}'s turn.`);
    ws.send(JSON.stringify({ error: "Not your turn", id: 0 }));
    return;
  }

  markAttack(gameId, x, y);

  const enemy = game.players.find((p) => p.id !== indexPlayer);
  if (!enemy) {
    console.log(
      `[Error] Enemy not found for player ${indexPlayer} in game ${gameId}.`,
    );
    return;
  }

  const ships: Ship[] = normalizeShips(enemy.ships);
  let status: "miss" | "shot" | "killed" = "miss";

  console.log(
    `[Info] Processing attack at (${x}, ${y}) by ${indexPlayer} against ${enemy.id}`,
  );

  for (const ship of ships) {
    const { x: startX, y: startY } = ship.position;
    console.log(`SHIP ${JSON.stringify(ship)}`);
    console.log(
      `[Debug] Checking ship at (${startX}, ${startY}) with length ${ship.length} and direction ${ship.direction}`,
    );

    const isVertical = ship.direction;
    let hit = false;

    for (let i = 0; i < ship.length; i++) {
      const shipX = isVertical ? startX : startX + i;
      const shipY = isVertical ? startY + i : startY;
      console.log(`[Debug] Checking segment at (${shipX}, ${shipY})`);

      if (shipX === x && shipY === y) {
        hit = true;
        status = "shot";
        console.log(`[Info] Hit confirmed on segment at (${shipX}, ${shipY})`);

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
          console.log(`[Info] Ship destroyed at (${startX}, ${startY})`);

          for (let i = 0; i < ship.length; i++) {
            const killedX = isVertical ? startX : startX + i;
            const killedY = isVertical ? startY + i : startY;

            game.players.forEach((player) => {
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

    console.log(`я в атаке победитель ${indexPlayer}`);

    console.log("getPlayersList", getPlayersList());
    game.players.forEach((player) => {
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

  console.log(
    `[Info] Attack result: ${status} by ${indexPlayer} at (${x}, ${y})`,
  );

  if (status === "miss") {
    game.currentTurn = enemy.id;
  }

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

  console.log(`[Info] Next turn: ${game.currentTurn}`);
}
