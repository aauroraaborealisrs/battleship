import { games } from "../handlers/addShips";
import { activeGames } from "../handlers/addUserToRoom";
import { getPlayer } from "../playersdb";
import { updateWinners } from "./updateWinners";

export function updateWinner(gameId: string, winnerId: string) {
  console.log(
    `[Debug] Running updateWinner for gameId: ${gameId}, winnerId: ${winnerId}`,
  );

  const game = games.get(gameId);
  if (!game) {
    console.log(`[Error] Game with ID ${gameId} not found.`);
    return;
  }

  const activeGame = activeGames.get(gameId);
  if (!activeGame) {
    console.log(`[Error] Active game with ID ${gameId} not found.`);
    return;
  }

  const winnerUsername =
    winnerId === "player_1" ? activeGame.player1 : activeGame.player2;

  const playerData = getPlayer(winnerUsername);
  if (playerData) {
    playerData.wins += 1;
    console.log(`Updated wins for ${winnerUsername}: ${playerData.wins}`);
  } else {
    console.log(
      `[Error] Player data not found for username: ${winnerUsername}`,
    );
  }

  updateWinners();
}
