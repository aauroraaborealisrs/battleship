interface Ship {
  x: number;
  y: number;
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export default function generateRandomShips(): Ship[] {
  const shipsSet1: Ship[] = [
    { x: 5, y: 6, direction: false, type: "huge", length: 4 },
    { x: 1, y: 6, direction: true, type: "large", length: 3 },
    { x: 5, y: 0, direction: true, type: "large", length: 3 },
    { x: 7, y: 1, direction: true, type: "medium", length: 2 },
    { x: 7, y: 8, direction: true, type: "medium", length: 2 },
    { x: 1, y: 2, direction: true, type: "medium", length: 2 },
    { x: 0, y: 0, direction: true, type: "small", length: 1 },
    { x: 7, y: 4, direction: true, type: "small", length: 1 },
    { x: 4, y: 8, direction: false, type: "small", length: 1 },
    { x: 3, y: 5, direction: false, type: "small", length: 1 },
  ];

  const shipsSet2: Ship[] = [
    { x: 0, y: 3, direction: true, type: "huge", length: 4 },
    { x: 6, y: 5, direction: true, type: "large", length: 3 },
    { x: 3, y: 5, direction: true, type: "large", length: 3 },
    { x: 6, y: 1, direction: true, type: "medium", length: 2 },
    { x: 8, y: 0, direction: true, type: "medium", length: 2 },
    { x: 3, y: 1, direction: true, type: "medium", length: 2 },
    { x: 8, y: 7, direction: false, type: "small", length: 1 },
    { x: 2, y: 9, direction: true, type: "small", length: 1 },
    { x: 1, y: 0, direction: true, type: "small", length: 1 },
    { x: 0, y: 9, direction: false, type: "small", length: 1 },
  ];

  const shipsSet3: Ship[] = [
    { x: 3, y: 8, direction: false, type: "huge", length: 4 },
    { x: 1, y: 0, direction: true, type: "large", length: 3 },
    { x: 4, y: 0, direction: true, type: "large", length: 3 },
    { x: 0, y: 9, direction: false, type: "medium", length: 2 },
    { x: 7, y: 2, direction: false, type: "medium", length: 2 },
    { x: 0, y: 6, direction: false, type: "medium", length: 2 },
    { x: 3, y: 5, direction: false, type: "small", length: 1 },
    { x: 6, y: 0, direction: true, type: "small", length: 1 },
    { x: 6, y: 4, direction: true, type: "small", length: 1 },
    { x: 0, y: 4, direction: false, type: "small", length: 1 },
  ];

  const shipsSets = [shipsSet1, shipsSet2, shipsSet3];
  return shipsSets[Math.floor(Math.random() * shipsSets.length)];
}
