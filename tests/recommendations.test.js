import test from "node:test";
import assert from "node:assert/strict";
import {
  buildProfile,
  rankRecommendations,
} from "../src/services/recommendationEngine.js";
import { formatTime } from "../src/utils/formatTime.js";
const track = (id, artistId = "a", genre = "Electronic") => ({
  id,
  artistId,
  artist: artistId,
  title: id,
  genre,
  plays: 10,
});
test("likes and playlist additions build artist and genre preferences", () => {
  const t = track("one");
  const p = buildProfile({ liked: [t], playlists: [{ songs: [t] }] });
  assert.equal(p.artists.a, 20);
  assert.equal(p.genres.Electronic, 18);
});
test("early skips reduce preference while completed and repeated plays improve it", () => {
  const p = buildProfile({
    stats: {
      one: {
        artistId: "a",
        genre: "Pop",
        plays: 1,
        completed: 0,
        skipped: 3,
        seconds: 8,
      },
      two: {
        artistId: "b",
        genre: "Rock",
        plays: 3,
        completed: 2,
        skipped: 0,
        seconds: 300,
      },
    },
  });
  assert.ok(p.artists.b > p.artists.a);
  assert.ok(p.tracks.one < 0);
});
test("recommendations deduplicate and spread artists while reducing recently played tracks", () => {
  const one = track("one");
  const p = buildProfile({ liked: [one] });
  const ranked = rankRecommendations(
    [
      one,
      one,
      track("two"),
      track("three"),
      track("four", "b"),
      track("five", "c"),
    ],
    p,
    [one],
  );
  assert.equal(new Set(ranked.map((t) => t.id)).size, 5);
  assert.equal(ranked[0].id, "two");
  assert.ok(ranked.slice(0, 4).some((t) => t.artistId === "b"));
  assert.ok(ranked.slice(0, 4).some((t) => t.artistId === "c"));
});
test("play count, search and time spent are included in recommendation profile", () => {
  const p = buildProfile({
    history: [{ ...track("one"), playCount: 3 }],
    searches: ["Ambient"],
    stats: {
      one: {
        artistId: "a",
        genre: "Electronic",
        plays: 3,
        completed: 1,
        seconds: 600,
        skipped: 0,
      },
    },
  });
  assert.equal(p.searches[0], "ambient");
  assert.ok(p.tracks.one >= 27);
});
test("time formatting tolerates invalid metadata and long tracks", () => {
  assert.equal(formatTime(NaN), "0:00");
  assert.equal(formatTime(-2), "0:00");
  assert.equal(formatTime(3661), "61:01");
  assert.equal(formatTime(125.9), "2:05");
});
