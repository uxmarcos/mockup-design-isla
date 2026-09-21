const MALE = ["M1", "M2", "M3", "M5", "M6"];
const FEMALE = ["F1", "F2", "F5", "F6", "F8"];

const FEMALE_NAMES = new Set(["sarah", "priya", "beatriz", "ingrid", "raquel", "isabel", "karen", "aline", "luiza"]);

function firstName(name: string) {
  return name
    .trim()
    .split(/\s+/)[0]
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function isFemale(name: string) {
  const f = firstName(name);
  return FEMALE_NAMES.has(f) || f.endsWith("a");
}

export function avatarSrc(file: string) {
  return `/avatars/${file}.png`;
}

/** Same name always maps to the same photo, picked from the matching gender set. */
export function personAvatar(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pool = isFemale(name) ? FEMALE : MALE;
  return avatarSrc(pool[h % pool.length]);
}
