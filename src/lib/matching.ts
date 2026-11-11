/**
 * Ranks a shop's frames for a detected face shape using the frame's own analysed
 * attributes (shape / category / name / description). No hardcoded inventory IDs.
 */
const PREFERRED: Record<string, string[]> = {
  round:   ["rectang", "square", "angular", "geometric", "wayfarer", "browline", "aviator"],
  oval:    ["wayfarer", "aviator", "square", "rectang", "geometric", "cat", "round", "oval"],
  square:  ["round", "oval", "aviator", "cat", "panto", "phantos"],
  heart:   ["aviator", "oval", "round", "rimless", "panto", "light"],
  diamond: ["cat", "oval", "browline", "rimless", "round"],
  oblong:  ["oversize", "square", "round", "wayfarer", "wrap", "large"],
};

const faceKey = (shape: string): string => {
  const s = (shape || "").toLowerCase();
  return Object.keys(PREFERRED).find((k) => s.includes(k)) || "";
};

export function rankFramesForFace<T extends Record<string, any>>(
  items: T[], faceShape: string, gender?: "Men" | "Women" | null
): T[] {
  const prefs = PREFERRED[faceKey(faceShape)] || [];
  const score = (it: T): number => {
    let s = 0;
    const text = [it.shape, it.shapeCategory, it.category, it.frame_name, it.model_name, it.description]
      .filter(Boolean).join(" ").toLowerCase();
    prefs.forEach((p, i) => { if (text.includes(p)) s += prefs.length - i; });
    if (gender && it.target_gender && it.target_gender !== "Unisex") s += it.target_gender === gender ? 2 : -10;
    return s;
  };
  // Array.prototype.sort is stable, so frames with equal scores keep the shop's own order (newest first)
  return [...items].sort((a, b) => score(b) - score(a));
}
