import { useParams, Link } from "react-router-dom";
import { Play, Shuffle, Plus } from "lucide-react";
import useAsync from "../hooks/useAsync";
import {
  getAlbum,
  getAlbumTracks,
  getTrackDetails,
} from "../services/musicApi";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { formatTime } from "../utils/formatTime";
import { Artwork, Skeleton, ErrorState, Empty } from "../components/common/UI";
import TrackList from "../components/cards/TrackList";
export default function Album() {
  const { id } = useParams();
  const p = usePlayer(),
    l = useLibrary();
  const state = useAsync(
    async (signal) => {
      if (id.startsWith("track-")) {
        const t = await getTrackDetails(id.slice(6), signal);
        return {
          name: t.title,
          artist: t.artist,
          artistId: t.artistId,
          artwork: t.artwork,
          date: t.date,
          tracks: [t],
          type: "Single",
        };
      }
      const [a, tracks] = await Promise.all([
        getAlbum(id, signal),
        getAlbumTracks(id, signal),
      ]);
      return {
        name: a.playlist_name,
        artist: a.user?.name,
        artistId: a.user?.id,
        artwork: a.artwork?.["480x480"],
        date: a.created_at,
        tracks,
        type: a.is_album ? "Album" : "Collection",
      };
    },
    [id],
  );
  if (state.loading)
    return (
      <div className="page">
        <Skeleton cards />
      </div>
    );
  if (state.error)
    return (
      <div className="page">
        <ErrorState error={state.error} retry={state.retry} />
      </div>
    );
  const a = state.data;
  return (
    <div className="page">
      <section className="entity-hero">
        <Artwork src={a.artwork} alt={a.name} />
        <div>
          <span className="eyebrow">{a.type}</span>
          <h1>{a.name}</h1>
          <p>
            <Link to={`/artist/${a.artistId}`}>{a.artist}</Link> ·{" "}
            {a.date ? new Date(a.date).getFullYear() : ""} · {a.tracks.length}{" "}
            {a.tracks.length === 1 ? "song" : "songs"} ·{" "}
            {formatTime(a.tracks.reduce((sum, t) => sum + t.duration, 0))}
          </p>
        </div>
      </section>
      <div className="entity-actions">
        <button
          className="button primary"
          disabled={!a.tracks.length}
          onClick={() => p.play(a.tracks)}
        >
          <Play size={18} fill="currentColor" />
          Play {a.type.toLowerCase()}
        </button>
        <button
          className="button secondary"
          disabled={!a.tracks.length}
          onClick={() => p.play(a.tracks, 0, true)}
        >
          <Shuffle size={18} />
          Shuffle
        </button>
        <button
          className="button secondary"
          onClick={() => {
            const pid = l.createPlaylist(a.name);
            a.tracks.forEach((t) => l.addToPlaylist(pid, t));
          }}
        >
          <Plus size={18} />
          Save as playlist
        </button>
      </div>
      {a.tracks.length ? (
        <TrackList tracks={a.tracks} />
      ) : (
        <Empty
          title="No available tracks"
          text="This release has no free, streamable tracks right now."
        />
      )}
    </div>
  );
}
