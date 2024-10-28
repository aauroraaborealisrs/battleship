import players, { getWinnersList } from "../playersdb";

export function updateWinners() {
  const winnersData = JSON.stringify({
    type: "update_winners",
    data: JSON.stringify(getWinnersList()),
    id: 0,
  });

  players.forEach(({ ws }) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(winnersData);
    }
  });
}
