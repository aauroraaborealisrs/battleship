import { games } from "../handlers/addShips";
import { activeGames } from "../handlers/addUserToRoom";
import { getPlayer } from "../playersdb";
import { updateWinners } from "./updateWinners";

export function updateWinner(gameId: string, winnerId: string) {
  const game = games.get(gameId);
  if (!game) {
    return;
  }

  const activeGame = activeGames.get(gameId);
  if (!activeGame) {
    return;
  }

  const winnerUsername =
    winnerId === "player_1" ? activeGame.player1 : activeGame.player2;

  const playerData = getPlayer(winnerUsername);
  if (playerData) {
    playerData.wins += 1;
  } else {
  }

  updateWinners();
}
