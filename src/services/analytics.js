import { storageService as storage } from "./storageService";
export function recordEvent(type, track, extra = {}) {
  const events = storage.read("events", []);
  events.push({
    type,
    trackId: track?.id,
    artistId: track?.artistId,
    genre: track?.genre,
    at: Date.now(),
    ...extra,
  });
  storage.write("events", events.slice(-800));
  if (!track?.id) return;
  const stats = storage.read("preferences", {});
  const s = stats[track.id] || {
    plays: 0,
    completed: 0,
    skipped: 0,
    seconds: 0,
    playlistAdds: 0,
    artistId: track.artistId,
    genre: track.genre,
  };
  if (type === "track_started") s.plays++;
  if (type === "track_completed") s.completed++;
  if (type === "track_skipped" && extra.seconds < 30) s.skipped++;
  if (type === "playlist_added") s.playlistAdds++;
  if (type === "listening_time") s.seconds += extra.seconds || 0;
  stats[track.id] = s;
  const keys = Object.keys(stats);
  if (keys.length > 500) delete stats[keys[0]];
  storage.write("preferences", stats);
}
