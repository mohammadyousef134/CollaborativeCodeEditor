// Deterministic color per user id, so the same person always gets the same
// badge color across sessions/reloads.
const COLORS = [
  "#e06c75", "#61afef", "#98c379", "#e5c07b",
  "#c678dd", "#56b6c2", "#d19a66", "#be5046"
];

export function colorForUserId(id) {
  const n = Number(id) || 0;
  return COLORS[n % COLORS.length];
}


export function colorLightForUserId(id) {
  const hex = colorForUserId(id);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.3)`;
}

export function initialsForName(name, id) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0][0] ?? "";
    const second = parts.length > 1 ? parts[1][0] : "";
    return (first + second).toUpperCase();
  }
  return `#${id}`;
}