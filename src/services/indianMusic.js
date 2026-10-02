import { storageService as storage } from "./storageService";
import { channels } from "./indianChannels";
import { normalizeFeed } from "./feedCatalog";
let cached = storage.read("indian_catalog", null),
  pending;
async function loadCatalog() {
  let fallback =
    Date.now() - (cached?.at || 0) < 30 * 86400000 ? cached?.tracks || [] : [];
  try {
    const r = await fetch(
      `${import.meta.env.BASE_URL}catalog.json?t=${Math.floor(Date.now() / 3600000)}`,
      { cache: "no-store", signal: AbortSignal.timeout(6000) },
    );
    if (r.ok) {
      const data = await r.json();
      if (Date.now() - Date.parse(data.updatedAt) < 30 * 86400000)
        fallback = data.tracks;
    }
  } catch {}
  const feeds = await Promise.allSettled(
    channels.map(async ([id, language]) => {
      const feed = "https://www.youtube.com/feeds/videos.xml?channel_id=" + id;
      const r = await fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=" +
          encodeURIComponent(feed),
        { signal: AbortSignal.timeout(7000) },
      );
      if (!r.ok) throw Error("Feed service unavailable");
      return normalizeFeed(await r.json(), id, language);
    }),
  );
  const live = feeds
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);
  const tracks = [
    ...new Map([...fallback, ...live].map((t) => [t.id, t])).values(),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  if (!tracks.length) throw Error("Indian music could not load. Please retry.");
  cached = {
    at: Date.now(),
    tracks,
    liveChannels: feeds.filter((r) => r.status === "fulfilled").length,
  };
  storage.write("indian_catalog", cached);
  return cached;
}
export async function refreshIndianCatalog() {
  cached = null;
  storage.remove("indian_catalog");
  return getIndianTracks();
}
export async function getIndianTracks(language, signal) {
  if (!cached || Date.now() - cached.at > 3600000) {
    if (!pending) pending = loadCatalog().finally(() => (pending = null));
    await pending;
  }
  if (signal?.aborted) throw signal.reason;
  return language
    ? cached.tracks.filter((t) => t.language === language)
    : cached.tracks;
}
export async function searchIndianTracks(query, signal) {
  const key = storage.read("youtube_key", "");
  const local = (await getIndianTracks(undefined, signal)).filter((t) =>
    `${t.title} ${t.artist} ${t.language}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  if (!key) return local;
  const params = new URLSearchParams({
    key,
    part: "snippet",
    q: query,
    type: "video",
    videoCategoryId: "10",
    videoEmbeddable: "true",
    regionCode: "IN",
    maxResults: "25",
  });
  const r = await fetch(
    "https://www.googleapis.com/youtube/v3/search?" + params,
    { signal },
  );
  const data = await r.json();
  if (!r.ok) throw Error(data.error?.message || "YouTube search unavailable");
  const found = data.items.map((t) => ({
    id: "yt:" + t.id.videoId,
    videoId: t.id.videoId,
    title: t.snippet.title,
    artist: t.snippet.channelTitle,
    artistId: "ytc:" + t.snippet.channelId,
    source: "youtube",
    artwork: t.snippet.thumbnails.high?.url || t.snippet.thumbnails.default.url,
    duration: 0,
    genre: "Indian",
    date: t.snippet.publishedAt,
    permalink: "https://www.youtube.com/watch?v=" + t.id.videoId,
  }));
  storage.write("youtube_results", { at: Date.now(), tracks: found });
  return [...new Map([...local, ...found].map((t) => [t.id, t])).values()];
}
export async function getYouTubeTrack(id, signal) {
  const tracks = await getIndianTracks(undefined, signal);
  const saved = storage.read("youtube_results", { tracks: [], at: 0 });
  const extras = Date.now() - saved.at < 30 * 86400000 ? saved.tracks : [];
  const t = [
    ...tracks,
    ...extras,
    ...storage.read("liked", []),
    ...storage.read("history", []),
    ...storage.read("player_state", { queue: [] }).queue,
    ...storage.read("playlists", []).flatMap((p) => p.songs),
  ].find((t) => t.id === id);
  if (!t)
    throw Error("This video is no longer in the catalog. Search for it again.");
  return t;
}
export async function getYouTubeArtistTracks(id, signal) {
  const main = await getIndianTracks(undefined, signal),
    results = storage.read("youtube_results", { at: 0, tracks: [] });
  const extra = Date.now() - results.at < 30 * 86400000 ? results.tracks : [];
  return [
    ...new Map(
      [
        ...main,
        ...extra,
        ...storage.read("liked", []),
        ...storage.read("player_state", { queue: [] }).queue,
      ]
        .filter((t) => t.artistId === id)
        .map((t) => [t.id, t]),
    ).values(),
  ];
}
