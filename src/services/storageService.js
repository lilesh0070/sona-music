const prefix = "sona_";
const memory = new Map();
let storageWarning = false;
export const storageService = {
  read(key, fallback) {
    try {
      const value =
        globalThis.localStorage?.getItem(prefix + key) ?? memory.get(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    const json = JSON.stringify(value);
    memory.set(key, json);
    try {
      globalThis.localStorage?.setItem(prefix + key, json);
    } catch {
      if (!storageWarning) {
        storageWarning = true;
        globalThis.dispatchEvent?.(
          new CustomEvent("sona:toast", {
            detail:
              "Device storage is full. Changes will last for this session.",
          }),
        );
      }
    }
    return value;
  },
  remove(key) {
    memory.delete(key);
    try {
      globalThis.localStorage?.removeItem(prefix + key);
    } catch {}
  },
};
