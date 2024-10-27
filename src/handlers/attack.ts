
import { games } from "./addShips";

interface Ship {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
  }
  
  export default function handleAttack(
    gameId: string,
    x: number,
    y: number,
    indexPlayer: string,
    ws: WebSocket
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
  
    const enemy = game.players.find((p) => p.id !== indexPlayer);
    if (!enemy) {
      console.log(`[Error] Enemy not found for player ${indexPlayer} in game ${gameId}.`);
      return;
    }
  
    
    const ships: Ship[] = enemy.ships;
    let status: "miss" | "shot" | "killed" = "miss";
  
    console.log(`[Info] Processing attack at (${x}, ${y}) by ${indexPlayer} against ${enemy.id}`);
  
    
    for (const ship of ships) {
      const { x: startX, y: startY } = ship.position;
      console.log(`SHIP ${JSON.stringify(ship)}`);
      console.log(`[Debug] Checking ship at (${startX}, ${startY}) with length ${ship.length} and direction ${ship.direction}`);
  
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
  
          
          const allSegmentsHit = ships.every(s => s.position.x === shipX && s.position.y === shipY);
          
          if (allSegmentsHit) {
            status = "killed";
            console.log(`[Info] Ship destroyed at (${startX}, ${startY})`);
          }
          break;
        }
      }
  
      if (hit) break;
    }
  
      
      const allShipsDestroyed = enemy.ships.every(ship =>
        enemy.hits.some(hitCoord =>
            (ship.direction
                ? ship.x === hitCoord.x && hitCoord.y >= ship.y && hitCoord.y < ship.y + ship.length
                : ship.y === hitCoord.y && hitCoord.x >= ship.x && hitCoord.x < ship.x + ship.length)
        )
    );

    if (allShipsDestroyed) {
        console.log(`[Info] Player ${indexPlayer} wins the game ${gameId}`);
        game.players.forEach((player) => {
            player.ws.send(JSON.stringify({
                type: "finish",
                data: JSON.stringify({
                    winPlayer: indexPlayer,
                }),
                id: 0
            }));
        });
        games.delete(gameId); 
        return;
    }

    
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

    console.log(`[Info] Attack result: ${status} by ${indexPlayer} at (${x}, ${y})`);

    
    if (status === "miss") {
        game.currentTurn = enemy.id;
    }

    
    game.players.forEach((player) => {
        player.ws.send(JSON.stringify({
            type: "turn",
            data: JSON.stringify({
                currentPlayer: game.currentTurn,
            }),
            id: 0
        }));
    });

    console.log(`[Info] Next turn: ${game.currentTurn}`);
  }
  