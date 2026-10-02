import * as audius from "./audiusApi";
import {
  getIndianTracks,
  searchIndianTracks,
  getYouTubeTrack,
  getYouTubeArtistTracks,
} from "./indianMusic";
import { buildProfile, rankRecommendations } from "./recommendationEngine";
export * from "./audiusApi";
export const genres = [
  { name: "Hindi", color: "#9d4b54", subtitle: "Bollywood & Hindi sounds" },
  { name: "Punjabi", color: "#866329", subtitle: "Punjab on repeat" },
  { name: "Haryanvi", color: "#427c6c", subtitle: "Desi beats, big energy" },
  ...audius.genres,
];
const merge = (sets) => [
  ...new Map(sets.flat().map((t) => [t.id, t])).values(),
];
export async function searchTracks(q, signal) {
  const results = await Promise.allSettled([
    searchIndianTracks(q, signal),
    audius.searchTracks(q, signal),
  ]);
  if (signal?.aborted) throw signal.reason;
  if (results.every((r) => r.status === "rejected")) throw results[0].reason;
  const found = merge(
    results.filter((r) => r.status === "fulfilled").map((r) => r.value),
  );
  if (results[0].status === "rejected")
    found.warning = results[0].reason.message;
  return found;
}
export async function getTrendingTracks(genre, signal) {
  if (["Hindi", "Punjabi", "Haryanvi"].includes(genre))
    return getIndianTracks(genre, signal);
  if (genre) return audius.getTrendingTracks(genre, signal);
  try {
    return await getIndianTracks(undefined, signal);
  } catch (e) {
    if (signal?.aborted) throw e;
    return audius.getTrendingTracks(undefined, signal);
  }
}
export const getGenreTracks = getTrendingTracks;
export const getPopularTracks = (signal) =>
  getTrendingTracks(undefined, signal);
export async function getNewReleases(signal) {
  return (await getTrendingTracks(undefined, signal))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 40);
}
export async function getArtistTracks(id, signal) {
  return id.startsWith("ytc:")
    ? getYouTubeArtistTracks(id, signal)
    : audius.getArtistTracks(id, signal);
}
export async function getArtist(id, signal) {
  if (!id.startsWith("ytc:")) return audius.getArtist(id, signal);
  const t = (await getArtistTracks(id, signal))[0];
  if (!t) throw Error("This channel is not in the current catalog.");
  return {
    id,
    name: t.artist,
    profile_picture: { "480x480": t.artwork },
    follower_count: 0,
    bio: "Music from this YouTube channel. Playback availability is determined by the publisher.",
    handle: t.artist,
  };
}
export const getArtistAlbums = (id, signal) =>
  id.startsWith("ytc:")
    ? Promise.resolve([])
    : audius.getArtistAlbums(id, signal);
export const getTrackDetails = (id, signal) =>
  id.startsWith("yt:")
    ? getYouTubeTrack(id, signal)
    : audius.getTrackDetails(id, signal);
export async function searchArtists(q, signal) {
  const sets = await Promise.allSettled([
    getIndianTracks(undefined, signal),
    audius.searchArtists(q, signal),
  ]);
  const local =
    sets[0].status === "fulfilled"
      ? sets[0].value
          .filter((t) => t.artist.toLowerCase().includes(q.toLowerCase()))
          .map((t) => ({
            id: t.artistId,
            name: t.artist,
            profile_picture: { "480x480": t.artwork },
          }))
      : [];
  return merge([local, sets[1].status === "fulfilled" ? sets[1].value : []]);
}
export async function getFavoriteArtistTracks(liked, signal) {
  return merge(
    await Promise.all(
      [...new Set(liked.map((t) => t.artistId))]
        .slice(0, 3)
        .map((id) => getArtistTracks(id, signal).catch(() => [])),
    ),
  );
}
export async function getRecommendations(library, signal) {
  const profile = buildProfile(library);
  const favorite = Object.entries(profile.genres).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  const sets = await Promise.all([
    getPopularTracks(signal),
    favorite ? getGenreTracks(favorite, signal).catch(() => []) : [],
    getFavoriteArtistTracks(library.liked, signal),
  ]);
  return rankRecommendations(merge(sets), profile, library.history);
}
