import WebSocket from "ws";

// Создаем базу данных игроков в памяти с использованием Map
const players = new Map<
  string,
  { password: string; wins: number; ws: WebSocket }
>();

export function addPlayer(name: string, password: string, ws: WebSocket) {
  players.set(name, { password, wins: 0, ws });
}

export function getPlayer(name: string) {
  return players.get(name);
}

export function playerExists(name: string) {
  return players.has(name);
}

export function getPlayersList() {
  return Array.from(players.keys());
}

export default players;
