import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
export const channels = [
  ["UCq-Fj5jknLsUf-MWSy4_brA", "Hindi"],
  ["UC56gTxNs4f9xZ7Pa2i5xNzg", "Hindi"],
  ["UCJrDMFOdv1I2k8n9oK_V21w", "Hindi"],
  ["UCcvNYxWXR_5TjVK7cSCdW-g", "Punjabi"],
  ["UC9ChdqQRCaZmTCwSJ49tcbw", "Punjabi"],
  ["UCZRdNleCgW-BGUJf-bbjzQg", "Punjabi"],
  ["UCSmK5WX5U4gdtebWjoL81og", "Punjabi"],
  ["UCv8qvosLJ5Iu6TKkGmmaHeQ", "Haryanvi"],
  ["UCQuLyitHTE9LfUAxlhDfgig", "Haryanvi"],
  ["UCD-OOMi5fYimFlZ4Nfh8D3A", "Haryanvi"],
  ["UCOsyDsO5tIt-VZ1iwjdQmew", "Punjabi"],
  ["UC_A7K2dXFsTMAciGmnNxy-Q", "Hindi"],
];
const decode = (s) =>
  s
    ?.replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">") || "";
export function parseFeed(xml, language) {
  const rawChannel = xml.match(/<yt:channelId>(.*?)<\/yt:channelId>/)?.[1];
  const channelId = rawChannel?.startsWith("UC")
    ? rawChannel
    : "UC" + rawChannel;
  const author = decode(xml.match(/<author>\s*<name>(.*?)<\/name>/s)?.[1]);
  return [...xml.matchAll(/<entry>(.*?)<\/entry>/gs)].flatMap(([, entry]) => {
    const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = decode(entry.match(/<title>(.*?)<\/title>/s)?.[1]);
    // Feeds include promotional clips. Keep music uploads and omit clearly marked short promos.
    if (
      !/^[\w-]{11}$/.test(videoId) ||
      /#[\s]*shorts|teaser|trailer|promo|preview|coming soon|behind the scenes/i.test(
        entry,
      )
    )
      return [];
    return [
      {
        id: "yt:" + videoId,
        videoId,
        title,
        artist: author,
        artistId: "ytc:" + channelId,
        source: "youtube",
        artwork: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: 0,
        genre: /punjabi/i.test(title)
          ? "Punjabi"
          : /haryanvi/i.test(title)
            ? "Haryanvi"
            : language,
        language: /punjabi/i.test(title)
          ? "Punjabi"
          : /haryanvi/i.test(title)
            ? "Haryanvi"
            : language,
        date: entry.match(/<published>(.*?)<\/published>/)?.[1],
        permalink: `https://www.youtube.com/watch?v=${videoId}`,
      },
    ];
  });
}
export async function refreshCatalog() {
  let previous = { tracks: [] };
  try {
    previous = JSON.parse(
      await fs.readFile(root + "public/catalog.json", "utf8"),
    );
  } catch {}
  const results = await Promise.allSettled(
    channels.map(async ([id, language]) => {
      const r = await fetch(
        "https://www.youtube.com/feeds/videos.xml?channel_id=" + id,
        { signal: AbortSignal.timeout(20000) },
      );
      if (!r.ok) throw Error(`${id}: ${r.status}`);
      const xml = await r.text();
      console.log(language, decode(xml.match(/<title>(.*?)<\/title>/)?.[1]));
      return parseFeed(xml, language);
    }),
  );
  const good = results.filter((r) => r.status === "fulfilled");
  if (!good.length)
    throw Error("Every feed failed; preserving the previous catalog.");
  for (const r of results)
    if (r.status === "rejected") console.warn(r.reason.message);
  // YouTube metadata is refreshed rather than accumulated beyond 30 days.
  const retained = previous.tracks.filter(
    (t) => Date.now() - Date.parse(t.date) < 30 * 86400000,
  );
  const tracks = [
    ...new Map(
      [...retained, ...good.flatMap((r) => r.value)].map((t) => [t.id, t]),
    ).values(),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  await fs.writeFile(
    root + "public/catalog.json",
    JSON.stringify(
      { updatedAt: new Date().toISOString(), channels: good.length, tracks },
      null,
      2,
    ) + "\n",
  );
  console.log(`${tracks.length} automatic Indian music entries`);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  await refreshCatalog();
