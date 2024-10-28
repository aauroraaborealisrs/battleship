export function generateRoomId(): string {
  return `room_${Math.floor(Math.random() * 100000)}_${Date.now()}`;
}

export function generatePlayerId(): string {
  return `player_${Math.floor(Math.random() * 100000)}_${Date.now()}`;
}
