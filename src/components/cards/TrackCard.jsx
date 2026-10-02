import { Link } from "react-router-dom";
import { Play, Pause, Heart } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";
import { Artwork, IconButton } from "../common/UI";
import TrackMenu from "./TrackMenu";
export default function TrackCard({ track, tracks = [track] }) {
  const p = usePlayer(),
    l = useLibrary();
  const active = p.current?.id === track.id && p.playing;
  return (
    <article className="track-card">
      <div className="card-art">
        <Link
          to={`/album/${track.albumId || `track-${track.id}`}`}
          aria-label={`View ${track.title}`}
        >
          <Artwork src={track.artwork} alt={`${track.title} cover`} />
        </Link>
        <button
          className="floating-play"
          aria-label={`${active ? "Pause" : "Play"} ${track.title}`}
          onClick={() =>
            active
              ? p.toggle()
              : p.play(
                  tracks,
                  tracks.findIndex((t) => t.id === track.id),
                )
          }
        >
          {active ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>
        <IconButton
          className={`card-like ${l.isLiked(track) ? "liked" : ""}`}
          label={`${l.isLiked(track) ? "Unlike" : "Like"} ${track.title}`}
          onClick={() => l.toggleLike(track)}
        >
          <Heart size={17} fill={l.isLiked(track) ? "currentColor" : "none"} />
        </IconButton>
      </div>
      <div className="card-caption">
        <div>
          <Link
            className="track-title"
            to={`/album/${track.albumId || `track-${track.id}`}`}
          >
            {track.title}
          </Link>
          <Link className="artist-name" to={`/artist/${track.artistId}`}>
            {track.artist}
          </Link>
        </div>
        <TrackMenu track={track} />
      </div>
    </article>
  );
}
