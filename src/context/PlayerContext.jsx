import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useLibrary } from "./LibraryContext";
import { storageService as storage } from "../services/storageService";
import { getStreamSources } from "../services/musicApi";
import { recordEvent } from "../services/analytics";
import { loadYouTubeAPI } from "../services/youtubePlayer";
import { useLocation } from "react-router-dom";
const PlayerContext = createContext();
export function PlayerProvider({ children }) {
  const library = useLibrary();
  const location = useLocation();
  const [videoClosed, setVideoClosed] = useState(false);
  const youtube = useRef(null),
    youtubeMount = useRef(null),
    youtubeReady = useRef(null);
  const isYouTube = () => live.current.current?.source === "youtube";
  const position = () =>
    isYouTube()
      ? youtube.current?.getCurrentTime?.() || 0
      : audio.current?.currentTime || 0;
  const pauseMedia = () => {
    audio.current?.pause();
    youtube.current?.pauseVideo?.();
  };
  const libraryRef = useRef(library);
  libraryRef.current = library;
  const [initial] = useState(() =>
    storage.read("player_state", {
      queue: [],
      index: 0,
      volume: 0.7,
      shuffle: false,
      repeat: "off",
    }),
  );
  const [queue, setQueue] = useState(initial.queue || []),
    [index, setIndex] = useState(initial.index || 0),
    [playing, setPlaying] = useState(false),
    [loading, setLoading] = useState(false),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(initial.volume ?? 0.7),
    [muted, setMuted] = useState(false),
    [shuffle, setShuffle] = useState(initial.shuffle || false),
    [repeat, setRepeat] = useState(initial.repeat || "off"),
    [nonce, setNonce] = useState(0),
    [queueOpen, setQueueOpen] = useState(false),
    [error, setError] = useState("");
  const audio = useRef(null),
    intent = useRef(false),
    sources = useRef([]),
    sourceIndex = useRef(0),
    sessionSeconds = useRef(0),
    previousTick = useRef(0),
    active = useRef(null),
    restoreTime = useRef(initial.time || 0),
    started = useRef(false);
  const current = queue[index] || null;
  const live = useRef({});
  live.current = {
    queue,
    index,
    current,
    playing,
    shuffle,
    repeat,
    time,
    volume,
    muted,
  };
  const flush = useCallback((skipped = false) => {
    const t = active.current;
    if (t && sessionSeconds.current > 0) {
      recordEvent("listening_time", t, { seconds: sessionSeconds.current });
      if (skipped)
        recordEvent("track_skipped", t, { seconds: sessionSeconds.current });
    }
    sessionSeconds.current = 0;
  }, []);
  const begin = (tracks, i = 0, random = false) => {
    if (!tracks.length) return;
    setVideoClosed(false);
    flush(true);
    restoreTime.current = 0;
    intent.current = true;
    setError("");
    setQueue(tracks);
    setIndex(random ? Math.floor(Math.random() * tracks.length) : i);
    setShuffle(random);
    setNonce((n) => n + 1);
  };
  const advance = useCallback(
    (ended = false) => {
      const s = live.current;
      if (!s.current) return;
      flush(!ended);
      restoreTime.current = 0;
      if (ended && s.repeat === "one") {
        intent.current = true;
        setNonce((n) => n + 1);
        return;
      }
      let next = s.index + 1;
      if (s.shuffle && s.queue.length > 1) {
        do {
          next = Math.floor(Math.random() * s.queue.length);
        } while (next === s.index);
      }
      if (next >= s.queue.length) {
        if (s.repeat === "all") next = 0;
        else {
          intent.current = false;
          pauseMedia();
          setPlaying(false);
          return;
        }
      }
      intent.current = true;
      setIndex(next);
      setNonce((n) => n + 1);
    },
    [flush],
  );
  const previous = () => {
    if (position() > 3) {
      seek(0);
      return;
    }
    flush(true);
    intent.current = true;
    restoreTime.current = 0;
    setIndex(Math.max(0, live.current.index - 1));
    setNonce((n) => n + 1);
  };
  const attemptPlay = () => {
    if (isYouTube()) {
      setVideoClosed(false);
      youtube.current?.playVideo?.();
      return;
    }
    const el = audio.current;
    if (!el) return;
    const src = el.src;
    el.play().catch((e) => {
      if (
        e.name === "AbortError" ||
        el.src !== src ||
        (!el.paused && el.readyState >= 2)
      )
        return;
      intent.current = false;
      setPlaying(false);
      setLoading(false);
      setError("Playback could not start. Tap play to retry.");
    });
  };
  const toggle = () => {
    if (!current) {
      libraryRef.current.toast("Pick a track to start listening");
      return;
    }
    if (loading || playing) {
      intent.current = false;
      pauseMedia();
      setPlaying(false);
      setLoading(false);
    } else {
      intent.current = true;
      if (error) {
        setNonce((n) => n + 1);
        setError("");
      } else attemptPlay();
    }
  };
  const seek = (value) => {
    if (isYouTube()) {
      if (!(youtube.current?.getDuration?.() || duration)) return;
      const target = Math.max(
        0,
        Math.min(value, youtube.current?.getDuration?.() || duration),
      );
      youtube.current?.seekTo?.(target, true);
      setTime(target);
      previousTick.current = target;
      return;
    }
    const el = audio.current;
    if (el && Number.isFinite(el.duration)) {
      el.currentTime = Math.max(0, Math.min(value, el.duration));
      setTime(el.currentTime);
      previousTick.current = el.currentTime;
    }
  };
  useEffect(() => {
    const el = audio.current;
    if (!current) {
      el.pause();
      return;
    }
    const ctrl = new AbortController();
    pauseMedia();
    setPlaying(false);
    setLoading(intent.current);
    setDuration(current.duration || 0);
    setTime(restoreTime.current);
    setError("");
    active.current = current;
    sessionSeconds.current = 0;
    started.current = false;
    previousTick.current = restoreTime.current;
    if (current.source === "youtube") {
      setVideoClosed(false);
      el.removeAttribute("src");
      el.load();
      loadYouTubeAPI()
        .then(async (YT) => {
          if (ctrl.signal.aborted) return;
          if (!youtube.current) {
            const mount = document.createElement("div");
            youtubeMount.current.replaceChildren(mount);
            youtubeReady.current = new Promise((resolve) => {
              youtube.current = new YT.Player(mount, {
                width: "100%",
                height: "100%",
                playerVars: {
                  playsinline: 1,
                  origin: window.location.origin,
                  controls: 1,
                },
                events: {
                  onReady: () => resolve(),
                  onAutoplayBlocked: () => {
                    setLoading(false);
                    setPlaying(false);
                    setError("Tap play in the YouTube player to start.");
                  },
                  onError: (event) => {
                    if (!isYouTube()) return;
                    setLoading(false);
                    setPlaying(false);
                    intent.current = false;
                    setError(
                      "YouTube video unavailable (" +
                        event.data +
                        "). Choose another song or watch on YouTube.",
                    );
                  },
                  onStateChange: (event) => {
                    if (!isYouTube()) return;
                    if (
                      (event.data === 0 || event.data === 1) &&
                      youtube.current.getVideoData()?.video_id !==
                        live.current.current?.videoId
                    )
                      return;
                    if (event.data === 1) {
                      setPlaying(true);
                      setLoading(false);
                      setError("");
                      intent.current = true;
                      const actualDuration = youtube.current.getDuration();
                      setDuration(actualDuration);
                      if (actualDuration > 0)
                        setQueue((q) =>
                          q.map((t) =>
                            t.id === live.current.current?.id
                              ? { ...t, duration: actualDuration }
                              : t,
                          ),
                        );
                      if (!started.current) {
                        started.current = true;
                        libraryRef.current.recordPlay(live.current.current);
                      }
                    } else if (event.data === 2) {
                      setPlaying(false);
                      setLoading(false);
                      intent.current = false;
                    } else if (event.data === 3) setLoading(true);
                    else if (event.data === 5)
                      setDuration(
                        youtube.current.getDuration() ||
                          live.current.current?.duration ||
                          0,
                      );
                    else if (event.data === 0) {
                      setPlaying(false);
                      recordEvent("track_completed", live.current.current);
                      advance(true);
                    }
                  },
                },
              });
            });
          }
          await youtubeReady.current;
          if (ctrl.signal.aborted) return;
          youtube.current.setVolume(live.current.volume * 100);
          live.current.muted
            ? youtube.current.mute()
            : youtube.current.unMute();
          const item = {
            videoId: current.videoId,
            startSeconds: restoreTime.current,
          };
          restoreTime.current = 0;
          intent.current
            ? youtube.current.loadVideoById(item)
            : youtube.current.cueVideoById(item);
        })
        .catch((e) => {
          if (!ctrl.signal.aborted) {
            setError(e.message);
            setLoading(false);
            intent.current = false;
          }
        });
      return () => ctrl.abort();
    }
    getStreamSources(current.id, ctrl.signal)
      .then((urls) => {
        if (ctrl.signal.aborted) return;
        sources.current = urls;
        sourceIndex.current = 0;
        el.src = urls[0];
        el.load();
        if (intent.current) attemptPlay();
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) {
          setError(e.message);
          setLoading(false);
          intent.current = false;
        }
      });
    return () => ctrl.abort();
  }, [current?.id, nonce]);
  useEffect(() => {
    audio.current.volume = volume;
    audio.current.muted = muted;
    youtube.current?.setVolume?.(volume * 100);
    if (muted) youtube.current?.mute?.();
    else youtube.current?.unMute?.();
  }, [volume, muted]);
  useEffect(() => {
    storage.write("player_state", {
      queue,
      index,
      volume,
      shuffle,
      repeat,
      time: restoreTime.current || position(),
    });
  }, [queue, index, volume, shuffle, repeat]);
  useEffect(() => {
    const timer = setInterval(() => {
      const el = audio.current;
      const now = position();
      if (isYouTube() ? live.current.playing : !el.paused) {
        const delta = now - previousTick.current;
        if (delta > 0 && delta < 2.5) sessionSeconds.current += delta;
        previousTick.current = now;
        if (isYouTube()) setTime(now);
      }
      if (!live.current.playing) return;
      storage.write("player_state", {
        ...live.current,
        time: now,
        volume: el.volume,
        playing: undefined,
        current: undefined,
      });
    }, 1000);
    const persist = () => {
      flush();
      storage.write("player_state", {
        ...live.current,
        time: restoreTime.current || position(),
        volume: audio.current.volume,
        current: undefined,
        playing: undefined,
      });
    };
    const visibility = () => {
      if (document.hidden && isYouTube()) {
        pauseMedia();
        setPlaying(false);
        intent.current = false;
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", persist);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", visibility);
      flush();
    };
  }, [flush]);
  useEffect(() => {
    const key = (e) => {
      if (
        /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) ||
        e.target.isContentEditable ||
        document.querySelector('[role="dialog"]')
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        seek(time + 10);
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        seek(time - 10);
      }
      if (e.key.toLowerCase() === "m") setMuted((v) => !v);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const addQueue = (track, next = false) => {
    setQueue((q) => {
      if (!q.length) return [track];
      const copy = [...q];
      copy.splice(next ? live.current.index + 1 : copy.length, 0, track);
      return copy;
    });
    libraryRef.current.toast(next ? "Playing next" : "Added to queue");
  };
  const removeQueue = (i) => {
    if (i === index) return;
    setQueue((q) => q.filter((_, n) => n !== i));
    if (i < index) setIndex((n) => n - 1);
  };
  const moveQueue = (i, step) => {
    const target = i + step;
    if (i <= index || target <= index || target >= queue.length) return;
    setQueue((q) => {
      const c = [...q];
      [c[i], c[target]] = [c[target], c[i]];
      return c;
    });
  };
  const clearQueue = () => {
    setQueue((q) => q.slice(0, index + 1));
    libraryRef.current.toast("Upcoming queue cleared");
  };
  const failSource = () => {
    if (isYouTube()) return;
    const el = audio.current;
    if (sourceIndex.current < sources.current.length - 1) {
      sourceIndex.current++;
      restoreTime.current = el.currentTime || 0;
      el.src = sources.current[sourceIndex.current];
      el.load();
      if (intent.current) attemptPlay();
    } else {
      setLoading(false);
      setPlaying(false);
      intent.current = false;
      setError(
        "This track is unavailable right now. Retry or choose another track.",
      );
    }
  };
  return (
    <PlayerContext.Provider
      value={{
        current,
        queue,
        index,
        playing,
        loading,
        time,
        duration,
        volume,
        muted,
        shuffle,
        repeat,
        error,
        queueOpen,
        setQueueOpen,
        play: begin,
        toggle,
        previous,
        next: () => advance(false),
        seek,
        setVolume,
        setMuted,
        setShuffle,
        cycleRepeat: () =>
          setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
        addQueue,
        removeQueue,
        moveQueue,
        clearQueue,
      }}
    >
      <audio
        ref={audio}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          setLoading(audio.current.readyState < 3);
        }}
        onPlaying={() => {
          setPlaying(true);
          setLoading(false);
          setError("");
          intent.current = true;
          if (!started.current) {
            started.current = true;
            libraryRef.current.recordPlay(live.current.current);
          }
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => {
          if (intent.current) setLoading(true);
        }}
        onCanPlay={() => setLoading(false)}
        onLoadedMetadata={() => {
          if (isYouTube()) return;
          const el = audio.current;
          setDuration(
            Number.isFinite(el.duration) ? el.duration : current?.duration || 0,
          );
          if (restoreTime.current) {
            el.currentTime = restoreTime.current;
            restoreTime.current = 0;
          }
        }}
        onTimeUpdate={() => {
          if (!isYouTube()) setTime(audio.current.currentTime);
        }}
        onEnded={() => {
          recordEvent("track_completed", live.current.current);
          advance(true);
        }}
        onError={failSource}
      />
      <section
        className={
          "youtube-dock " +
          (location.pathname === "/player" ? "expanded-watch" : "")
        }
        style={{
          display:
            current?.source === "youtube" && !videoClosed ? "block" : "none",
        }}
        aria-label="YouTube video player"
      >
        <div className="youtube-dock-heading">
          <span>Now watching · YouTube</span>
          <a
            href={current?.permalink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on YouTube ↗
          </a>
          <button
            className="video-close"
            aria-label="Close video and pause"
            onClick={() => {
              intent.current = false;
              pauseMedia();
              setPlaying(false);
              setLoading(false);
              setVideoClosed(true);
            }}
          >
            ×
          </button>
        </div>
        <div className="youtube-frame" ref={youtubeMount} />
      </section>
      {children}
    </PlayerContext.Provider>
  );
}
export const usePlayer = () => useContext(PlayerContext);
