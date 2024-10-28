import { Ship } from "./attack";

export default function markShipAsKilled(
  ship: Ship,
  game: any,
  indexPlayer: string,
) {
  const { x: startX, y: startY } = ship.position;
  const isVertical = ship.direction;

  for (let i = 0; i < ship.length; i++) {
    const shipX = isVertical ? startX : startX + i;
    const shipY = isVertical ? startY + i : startY;

    game.players.forEach((player) => {
      player.ws.send(
        JSON.stringify({
          type: "attack",
          data: JSON.stringify({
            position: { x: shipX, y: shipY },
            currentPlayer: indexPlayer,
            status: "killed",
          }),
          id: 0,
        }),
      );
    });
  }

  for (let i = -1; i <= ship.length; i++) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const adjX = isVertical ? startX + dx : startX + i * (1 - Math.abs(dx));
        const adjY = isVertical ? startY + i * (1 - Math.abs(dy)) : startY + dy;

        const isShipPart =
          (isVertical &&
            adjX === startX &&
            adjY >= startY &&
            adjY < startY + ship.length) ||
          (!isVertical &&
            adjY === startY &&
            adjX >= startX &&
            adjX < startX + ship.length);

        if (adjX >= 0 && adjX < 10 && adjY >= 0 && adjY < 10 && !isShipPart) {
          game.players.forEach((player) => {
            player.ws.send(
              JSON.stringify({
                type: "attack",
                data: JSON.stringify({
                  position: { x: adjX, y: adjY },
                  currentPlayer: indexPlayer,
                  status: "miss",
                }),
                id: 0,
              }),
            );
          });
        }
      }
    }
  }
}
