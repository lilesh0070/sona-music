export const excludedMusic =
  /#[\s]*shorts|teaser|trailer|promo|preview|coming soon|behind the scenes/i;
export function normalizeFeed(data, channelId, language) {
  if (data.status !== "ok" || !Array.isArray(data.items))
    throw Error("Music channel feed unavailable");
  return data.items.flatMap((item) => {
    let videoId;
    try {
      const url = new URL(item.link);
      if (!["youtube.com", "www.youtube.com"].includes(url.hostname)) return [];
      videoId = url.searchParams.get("v");
    } catch {
      return [];
    }
    if (
      !/^[\w-]{11}$/.test(videoId) ||
      excludedMusic.test(item.title + " " + (item.description || ""))
    )
      return [];
    const lang = /punjabi/i.test(item.title)
      ? "Punjabi"
      : /haryanvi/i.test(item.title)
        ? "Haryanvi"
        : language;
    return [
      {
        id: "yt:" + videoId,
        videoId,
        title: item.title,
        artist: item.author || data.feed.title,
        artistId: "ytc:" + channelId,
        source: "youtube",
        artwork: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: 0,
        genre: lang,
        language: lang,
        date: item.pubDate.replace(" ", "T") + "Z",
        permalink: `https://www.youtube.com/watch?v=${videoId}`,
      },
    ];
  });
}
