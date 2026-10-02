import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  Loader2,
  ChevronDown,
  X,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";
import { formatTime } from "../../utils/formatTime";
import { IconButton, Artwork, Modal, Empty } from "../common/UI";
export function PlayerControls({ large = false }) {
  const p = usePlayer();
  return (
    <div className={`transport ${large ? "large" : ""}`}>
      <IconButton
        className={p.shuffle ? "enabled" : ""}
        label="Shuffle"
        aria-pressed={p.shuffle}
        onClick={() => p.setShuffle(!p.shuffle)}
      >
        <Shuffle size={large ? 23 : 17} />
      </IconButton>
      <IconButton
        label="Previous track"
        disabled={!p.current}
        onClick={p.previous}
      >
        <SkipBack size={large ? 27 : 19} fill="currentColor" />
      </IconButton>
      <button
        className="main-play"
        disabled={!p.current}
        aria-label={p.playing ? "Pause" : "Play"}
        onClick={p.toggle}
      >
        {p.loading ? (
          <Loader2 className="spin" size={22} />
        ) : p.playing ? (
          <Pause size={large ? 28 : 22} fill="currentColor" />
        ) : (
          <Play size={large ? 28 : 22} fill="currentColor" />
        )}
      </button>
      <IconButton label="Next track" disabled={!p.current} onClick={p.next}>
        <SkipForward size={large ? 27 : 19} fill="currentColor" />
      </IconButton>
      <IconButton
        className={p.repeat !== "off" ? "enabled" : ""}
        label={`Repeat: ${p.repeat}`}
        onClick={p.cycleRepeat}
      >
        {p.repeat === "one" ? (
          <Repeat1 size={large ? 23 : 17} />
        ) : (
          <Repeat size={large ? 23 : 17} />
        )}
      </IconButton>
    </div>
  );
}
export function Progress() {
  const p = usePlayer();
  return (
    <div className="progress-row">
      <span>{formatTime(p.time)}</span>
      <input
        type="range"
        aria-label="Seek"
        min="0"
        max={p.duration || 1}
        step=".1"
        value={Math.min(p.time, p.duration || 1)}
        onChange={(e) => p.seek(Number(e.target.value))}
        style={{
          "--range-progress": `${p.duration ? (p.time / p.duration) * 100 : 0}%`,
        }}
      />
      <span>{formatTime(p.duration)}</span>
    </div>
  );
}
export function Volume() {
  const p = usePlayer();
  return (
    <div className="volume-control">
      <IconButton
        label={p.muted ? "Unmute" : "Mute"}
        onClick={() => p.setMuted(!p.muted)}
      >
        {p.muted || p.volume === 0 ? (
          <VolumeX size={19} />
        ) : (
          <Volume2 size={19} />
        )}
      </IconButton>
      <input
        type="range"
        min="0"
        max="1"
        step=".01"
        aria-label="Volume"
        value={p.muted ? 0 : p.volume}
        style={{ "--range-progress": `${(p.muted ? 0 : p.volume) * 100}%` }}
        onChange={(e) => {
          p.setVolume(Number(e.target.value));
          p.setMuted(false);
        }}
      />
    </div>
  );
}
export default function Player() {
  const p = usePlayer(),
    l = useLibrary();
  return (
    <>
      <div className="bottom-player">
        <div className="now-playing">
          <Link
            to="/player"
            className="player-art"
            aria-label="Open full player"
          >
            <Artwork src={p.current?.artwork} />
          </Link>
          <div className="player-track-name">
            <Link to="/player" className="track-title">
              {p.current?.title || "Your next favorite is waiting"}
            </Link>
            {p.current ? (
              <Link
                className="artist-name"
                to={`/artist/${p.current.artistId}`}
              >
                {p.current.artist}
              </Link>
            ) : (
              <span className="artist-name">
                Pick a track. Find your frequency.
              </span>
            )}
          </div>
          {p.current && (
            <IconButton
              className={l.isLiked(p.current) ? "liked" : ""}
              label={
                l.isLiked(p.current)
                  ? "Unlike current song"
                  : "Like current song"
              }
              onClick={() => l.toggleLike(p.current)}
            >
              <Heart
                size={18}
                fill={l.isLiked(p.current) ? "currentColor" : "none"}
              />
            </IconButton>
          )}
        </div>
        <div className="player-center">
          <PlayerControls />
          <Progress />
        </div>
        <div className="player-extras">
          <IconButton
            className={p.queueOpen ? "enabled" : ""}
            label="Open queue"
            onClick={() => p.setQueueOpen(!p.queueOpen)}
          >
            <ListMusic size={20} />
          </IconButton>
          <Volume />
          <Link
            className="icon-button"
            aria-label="Open full player"
            title="Open full player"
            to="/player"
          >
            <Maximize2 size={18} />
          </Link>
        </div>
        <button
          className="mobile-play"
          aria-label={p.playing ? "Pause" : "Play"}
          disabled={!p.current}
          onClick={p.toggle}
        >
          {p.loading ? (
            <Loader2 className="spin" />
          ) : p.playing ? (
            <Pause fill="currentColor" />
          ) : (
            <Play fill="currentColor" />
          )}
        </button>
        <div
          className="mobile-progress"
          style={{ width: `${p.duration ? (p.time / p.duration) * 100 : 0}%` }}
        />
      </div>
      {p.error && (
        <div className="player-error" role="alert">
          <span>{p.error}</span>
          <button onClick={p.toggle}>Retry</button>
          <button onClick={p.next}>Next track</button>
        </div>
      )}
      {p.queueOpen && <Queue />}
    </>
  );
}
export function Queue() {
  const p = usePlayer();
  return (
    <Modal title="Your queue" onClose={() => p.setQueueOpen(false)}>
      {!p.current ? (
        <Empty
          title="Nothing queued just yet"
          text="Play a track or add a few favorites."
        />
      ) : (
        <>
          <span className="eyebrow">NOW PLAYING</span>
          <div className="queue-track">
            <Artwork src={p.current.artwork} />
            <div>
              <b>{p.current.title}</b>
              <small>{p.current.artist}</small>
            </div>
          </div>
          <div className="queue-header">
            <h3>
              Up next <span>{p.queue.length - p.index - 1}</span>
            </h3>
            <button className="text-button" onClick={p.clearQueue}>
              Clear
            </button>
          </div>
          <div className="queue-list">
            {p.queue.slice(p.index + 1).map((t, j) => {
              const i = j + p.index + 1;
              return (
                <div className="queue-track" key={`${t.id}-${i}`}>
                  <Artwork src={t.artwork} />
                  <div>
                    <b>{t.title}</b>
                    <small>{t.artist}</small>
                  </div>
                  <IconButton
                    label={`Move ${t.title} up`}
                    disabled={j === 0}
                    onClick={() => p.moveQueue(i, -1)}
                  >
                    <ArrowUp size={15} />
                  </IconButton>
                  <IconButton
                    label={`Move ${t.title} down`}
                    disabled={i === p.queue.length - 1}
                    onClick={() => p.moveQueue(i, 1)}
                  >
                    <ArrowDown size={15} />
                  </IconButton>
                  <IconButton
                    label={`Remove ${t.title} from queue`}
                    onClick={() => p.removeQueue(i)}
                  >
                    <X size={16} />
                  </IconButton>
                </div>
              );
            })}
            {p.queue.length === p.index + 1 && (
              <p className="muted">
                The end of a good thing. Add something new.
              </p>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
