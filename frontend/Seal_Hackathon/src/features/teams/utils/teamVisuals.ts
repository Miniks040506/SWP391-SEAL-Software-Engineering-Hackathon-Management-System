const BROWSE_AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-sky-600",
];

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function getGradient(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return BROWSE_AVATAR_GRADIENTS[hash % BROWSE_AVATAR_GRADIENTS.length];
}
