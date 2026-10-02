import { Link } from "react-router-dom";
import { Heart, Play, Pause, AudioLines, Clock3 } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";
import { formatTime } from "../../utils/formatTime";
import { Artwork, IconButton } from "../common/UI";
import TrackMenu from "./TrackMenu";
export default function TrackList({ tracks, playlistId, compact = false }) {
  const p = usePlayer(),
    l = useLibrary();
  return (
    <div className={`track-list ${compact ? "compact-list" : ""}`}>
      <div className="list-header">
        <span>#</span>
        <span>Track</span>
        <span className="genre-column">Genre</span>
        <span />
        <Clock3 size={15} />
        <span />
      </div>
      {tracks.map((t, i) => (
        <div
          key={`${t.id}-${i}`}
          className={`track-row ${p.current?.id === t.id ? "current-row" : ""}`}
        >
          <button
            className="row-play"
            aria-label={`${p.current?.id === t.id && p.playing ? "Pause" : "Play"} ${t.title}`}
            onClick={() =>
              p.current?.id === t.id && p.playing
                ? p.toggle()
                : p.play(tracks, i)
            }
          >
            <span className="row-number">
              {p.current?.id === t.id && p.playing ? (
                <AudioLines size={18} />
              ) : (
                String(i + 1).padStart(2, "0")
              )}
            </span>
            <span className="row-play-icon">
              {p.current?.id === t.id && p.playing ? (
                <Pause size={16} />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </span>
          </button>
          <div className="row-track">
            <Artwork src={t.artwork} />
            <div>
              <Link
                className="track-title"
                to={`/album/${t.albumId || `track-${t.id}`}`}
              >
                {t.title}
              </Link>
              <Link className="artist-name" to={`/artist/${t.artistId}`}>
                {t.artist}
              </Link>
            </div>
          </div>
          <span className="genre-column">{t.genre}</span>
          <IconButton
            className={l.isLiked(t) ? "liked" : ""}
            label={`${l.isLiked(t) ? "Unlike" : "Like"} ${t.title}`}
            onClick={() => l.toggleLike(t)}
          >
            <Heart size={17} fill={l.isLiked(t) ? "currentColor" : "none"} />
          </IconButton>
          <span className="track-time">
            {t.source === "youtube" && !t.duration
              ? "YouTube"
              : formatTime(t.duration)}
          </span>
          <TrackMenu track={t} playlistId={playlistId} />
        </div>
      ))}
    </div>
  );
}
