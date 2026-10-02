import { buildProfile, rankRecommendations } from "./recommendationEngine";
const hosts = [
  "https://api.audius.co/v1",
  "https://discoveryprovider.audius.co/v1",
];
const cache = new Map();
export const genres = [
  { name: "Electronic", color: "#54345f", subtitle: "Find your frequency" },
  {
    name: "Hip-Hop/Rap",
    label: "Hip hop",
    color: "#985248",
    subtitle: "Beats with a pulse",
  },
  { name: "Pop", color: "#97753b", subtitle: "On repeat, always" },
  { name: "Rock", color: "#3f6165", subtitle: "Turn it all the way up" },
  {
    name: "R&B/Soul",
    label: "R&B & soul",
    color: "#694869",
    subtitle: "A little soul goes a long way",
  },
  { name: "Jazz", color: "#847057", subtitle: "Something timeless" },
  {
    name: "Lo-Fi",
    label: "Lo-fi",
    color: "#396966",
    subtitle: "Slow down. Tune in.",
  },
  { name: "Ambient", color: "#526c91", subtitle: "Room to breathe" },
  { name: "Dance", color: "#866038", subtitle: "Move to your own rhythm" },
  { name: "Acoustic", color: "#5d7155", subtitle: "Keep it close" },
  { name: "Alternative", color: "#77536c", subtitle: "Outside the ordinary" },
  {
    name: "Classical",
    color: "#6b6092",
    subtitle: "A different kind of escape",
  },
];
export const moods = [
  { name: "Late night", genre: "Electronic", color: "#504475" },
  { name: "Deep focus", genre: "Lo-Fi", color: "#477e78" },
  { name: "Slow mornings", genre: "Acoustic", color: "#b28850" },
  { name: "Good energy", genre: "Dance", color: "#b85b49" },
  { name: "On the move", genre: "Hip-Hop/Rap", color: "#527493" },
];
export const fallbackArt = `${import.meta.env.BASE_URL}fallback-art.svg`;
export function normalizeTrack(t) {
  return {
    id: t.id,
    title: t.title,
    artist: t.user?.name || "Unknown artist",
    artistId: t.user?.id,
    artistImage: t.user?.profile_picture?.["480x480"],
    artwork: t.artwork?.["480x480"] || fallbackArt,
    artworkMirrors: t.artwork?.mirrors || [],
    duration: t.duration || 0,
    genre: t.genre || "Electronic",
    mood: t.mood,
    tags: t.tags,
    plays: t.play_count || 0,
    date: t.release_date || t.created_at,
    albumId: t.album_backlink?.playlist_id || t.album_backlink?.id,
    albumName: t.album_backlink?.playlist_name,
    permalink: t.permalink,
  };
}
export const playable = (t) =>
  t.is_streamable !== false &&
  !t.is_stream_gated &&
  t.is_available !== false &&
  !t.is_delete;
async function request(path, params = {}, signal) {
  const query = new URLSearchParams({
    app_name: "Vibe",
    ...Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined),
    ),
  });
  const key = `${path}?${query}`;
  const old = cache.get(key);
  if (old && Date.now() - old.at < 120000) return old.data;
  let last;
  for (const host of hosts) {
    try {
      const timeout = AbortSignal.timeout(6000);
      const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
      const r = await fetch(`${host}${key}`, { signal: combined });
      if (!r.ok) throw new Error(`Music service returned ${r.status}`);
      const data = (await r.json()).data;
      cache.set(key, { at: Date.now(), data });
      return data;
    } catch (e) {
      if (signal?.aborted) throw e;
      last = e;
    }
  }
  throw new Error("The music service is taking a break. Please try again.", {
    cause: last,
  });
}
const tracks = (data) => (data || []).filter(playable).map(normalizeTrack);
export const searchTracks = (q, signal) =>
  request("/tracks/search", { query: q, limit: 48 }, signal).then(tracks);
export const getTrendingTracks = (genre, signal) =>
  request("/tracks/trending", { limit: 60, time: "week", genre }, signal).then(
    tracks,
  );
export const getPopularTracks = (signal) =>
  request("/tracks/trending", { limit: 60, time: "allTime" }, signal).then(
    tracks,
  );
export const getNewReleases = (signal) =>
  request("/tracks/latest", { limit: 30 }, signal).then(tracks);
export const getArtist = (id, signal) =>
  request(`/users/${encodeURIComponent(id)}`, {}, signal);
export const getArtistTracks = (id, signal) =>
  request(
    `/users/${encodeURIComponent(id)}/tracks`,
    { limit: 60 },
    signal,
  ).then(tracks);
export const getGenreTracks = (genre, signal) =>
  getTrendingTracks(genre, signal);
export const getTrackDetails = (id, signal) =>
  request(`/tracks/${encodeURIComponent(id)}`, {}, signal).then((d) =>
    normalizeTrack(Array.isArray(d) ? d[0] : d),
  );
export const getStreamUrl = (id) =>
  `${hosts[0]}/tracks/${encodeURIComponent(id)}/stream?app_name=Vibe`;
export async function getStreamSources(id, signal) {
  const d = await request(
    `/tracks/${encodeURIComponent(id)}`,
    { resolve: true },
    signal,
  );
  const t = Array.isArray(d) ? d[0] : d;
  if (!playable(t))
    throw new Error("This track is no longer available for free playback.");
  return [
    ...new Set([
      ...(t.stream?.url
        ? [
            t.stream.url,
            ...(t.stream.mirrors || []).map((host) => {
              const u = new URL(t.stream.url);
              return host + u.pathname + u.search;
            }),
          ]
        : []),
      getStreamUrl(id),
      `${hosts[1]}/tracks/${encodeURIComponent(id)}/stream?app_name=Vibe`,
    ]),
  ];
}
export const searchArtists = (q, signal) =>
  request("/users/search", { query: q, limit: 12 }, signal);
export const searchAlbums = (q, signal) =>
  request("/playlists/search", { query: q, limit: 24 }, signal).then((d) =>
    (d || []).filter((a) => a.is_album),
  );
export const getAlbum = (id, signal) =>
  request(`/playlists/${encodeURIComponent(id)}`, {}, signal).then((d) =>
    Array.isArray(d) ? d[0] : d,
  );
export const getAlbumTracks = (id, signal) =>
  request(`/playlists/${encodeURIComponent(id)}/tracks`, {}, signal).then(
    tracks,
  );
export const getArtistAlbums = (id, signal) =>
  request(`/users/${encodeURIComponent(id)}/albums`, { limit: 18 }, signal);
export async function getFavoriteArtistTracks(liked, signal) {
  const ids = [...new Set(liked.map((t) => t.artistId))].slice(0, 3);
  const sets = await Promise.all(
    ids.map((id) => getArtistTracks(id, signal).catch(() => [])),
  );
  return [...new Map(sets.flat().map((t) => [t.id, t])).values()];
}
export async function getRecommendations(library, signal) {
  const profile = buildProfile(library);
  const favorite = Object.entries(profile.genres).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  const [popular, specific, artists] = await Promise.all([
    getPopularTracks(signal),
    favorite
      ? getGenreTracks(favorite, signal).catch(() => [])
      : Promise.resolve([]),
    getFavoriteArtistTracks(library.liked, signal),
  ]);
  return rankRecommendations(
    [...artists, ...specific, ...popular],
    profile,
    library.history,
  );
}
