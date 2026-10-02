import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseFeed } from "../scripts/refresh-catalog.mjs";
import { normalizeFeed } from "../src/services/feedCatalog.js";
test("free JSON feed adapter validates YouTube links and never trusts third-party artwork URLs", () => {
  const data = {
    status: "ok",
    feed: { title: "Label" },
    items: [
      {
        title: "Punjabi Song",
        link: "https://www.youtube.com/watch?v=abcdefghijk",
        pubDate: "2026-10-02 12:00:00",
        thumbnail: "https://example.com/evil",
      },
      { title: "Other", link: "https://example.com/?v=abcdefghijk" },
      { title: "Teaser", link: "https://www.youtube.com/watch?v=lmnopqrstuv" },
    ],
  };
  const tracks = normalizeFeed(data, "UCsample", "Hindi");
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].language, "Punjabi");
  assert.equal(
    tracks[0].artwork,
    "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
  );
  assert.throws(() => normalizeFeed({ status: "error" }, "UCsample", "Hindi"));
});
test("channel feeds normalize music, decode entities and exclude promos", () => {
  const entry = (id, title) =>
    `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>2026-10-02T12:00:00Z</published></entry>`;
  const feed =
    "<feed><yt:channelId>sample-channel</yt:channelId><author><name>Music &amp; Co</name></author>" +
    entry("abcdefghijk", "New Punjabi Song &amp; More") +
    entry("lmnopqrstuv", "New Song Teaser") +
    entry("abcdefghij1", "New Track #shorts") +
    entry("bad-id", "Wrong") +
    "</feed>";
  const tracks = parseFeed(feed, "Hindi");
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].language, "Punjabi");
  assert.equal(tracks[0].artist, "Music & Co");
  assert.equal(tracks[0].artistId, "ytc:UCsample-channel");
  assert.equal(tracks[0].source, "youtube");
  assert.equal(tracks[0].title, "New Punjabi Song & More");
});
test("published Indian catalog includes all requested languages with unique valid video IDs", () => {
  const { tracks } = JSON.parse(
    fs.readFileSync(new URL("../public/catalog.json", import.meta.url), "utf8"),
  );
  for (const language of ["Hindi", "Punjabi", "Haryanvi"])
    assert.ok(tracks.some((t) => t.language === language));
  assert.equal(new Set(tracks.map((t) => t.id)).size, tracks.length);
  for (const t of tracks) {
    assert.match(t.videoId, /^[\w-]{11}$/);
    assert.match(t.artistId, /^ytc:UC[\w-]{22}$/);
    assert.equal(t.permalink, "https://www.youtube.com/watch?v=" + t.videoId);
  }
});
