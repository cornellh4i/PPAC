const TITLES = new Set(["dr", "mr", "mrs", "ms", "mx", "prof"]);

/** Up to two initials from a name, e.g. "Dr. Sarah Lee" -> "SL". */
export const getInitials = (name: string): string => {
  const words = name
    .replace(/\[[^\]]*\]|\([^)]*\)/g, " ") // drop tags like "[TEST]" or "(she/her)"
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, "")) // letters only
    .filter((word) => word && !TITLES.has(word.toLowerCase()));
  if (words.length === 0) return "";
  const initials =
    words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2);
  return initials.toUpperCase();
};
