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

export function initialsForName(name, id) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0][0] ?? "";
    const second = parts.length > 1 ? parts[1][0] : "";
    return (first + second).toUpperCase();
  }
  return `#${id}`;
}