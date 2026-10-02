let pending;
export function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending = null;
      reject(Error("YouTube could not load. Check your connection and retry."));
    }, 15000);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      previous?.();
      resolve(window.YT);
    };
    let script = document.querySelector("script[data-vibe-youtube]");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.dataset.vibeYoutube = "true";
      document.head.append(script);
    }
    script.onerror = () => {
      clearTimeout(timeout);
      script.remove();
      pending = null;
      reject(Error("YouTube could not load. Please retry."));
    };
  });
  return pending;
}
