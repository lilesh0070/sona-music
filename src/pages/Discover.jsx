import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { Play, Shuffle, Compass } from "lucide-react";
import useAsync from "../hooks/useAsync";
import useRecommendations from "../hooks/useRecommendations";
import {
  getTrendingTracks,
  getNewReleases,
  getFavoriteArtistTracks,
  genres,
} from "../services/musicApi";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { Skeleton, ErrorState, Artwork, Empty } from "../components/common/UI";
import TrackCard from "../components/cards/TrackCard";
import TrackList from "../components/cards/TrackList";
export default function Discover() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") || "for-you";
  const [genre, setGenre] = useState("");
  const l = useLibrary(),
    p = usePlayer();
  const recommendations = useRecommendations();
  const other = useAsync(
    (signal) =>
      view === "new"
        ? getNewReleases(signal)
        : view === "favorites"
          ? getFavoriteArtistTracks(l.liked, signal)
          : getTrendingTracks(genre || undefined, signal),
    [view, genre, l.liked.map((t) => t.artistId).join()],
  );
  const state = view === "for-you" ? recommendations : other;
  const tracks = state.data || [];
  const favoriteIds = new Set(l.liked.map((t) => t.artistId));
  const visible =
    view === "favorites"
      ? tracks.filter((t) => favoriteIds.has(t.artistId))
      : tracks;
  const artists = [...new Map(tracks.map((t) => [t.artistId, t])).values()];
  return (
    <div className="page">
      <span className="eyebrow">GO A LITTLE FURTHER</span>
      <h1>
        Good music finds you<span className="coral">.</span>
      </h1>
      <p className="page-description">
        Fresh sounds, familiar favorites, and everything in between.
      </p>
      <div className="filter-tabs">
        {[
          ["for-you", "For you"],
          ["new", "New releases"],
          ["artists", "Popular artists"],
          ["favorites", "Favorite artists"],
        ].map(([id, label]) => (
          <button
            className={`pill ${view === id ? "selected" : ""}`}
            key={id}
            onClick={() => setParams(id === "for-you" ? {} : { view: id })}
          >
            {label}
          </button>
        ))}
      </div>
      {view !== "for-you" && view !== "favorites" && (
        <label className="genre-select">
          Choose a genre{" "}
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.name} value={g.name}>
                {g.label || g.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {state.loading ? (
        <Skeleton cards />
      ) : state.error ? (
        <ErrorState error={state.error} retry={state.retry} />
      ) : view === "artists" ? (
        <div className="card-grid">
          {artists.map((a) => (
            <Link
              key={a.artistId}
              className="artist-card"
              to={`/artist/${a.artistId}`}
            >
              <Artwork src={a.artistImage || a.artwork} />
              <h3>{a.artist}</h3>
              <span>Artist</span>
            </Link>
          ))}
        </div>
      ) : visible.length ? (
        <>
          <div className="browse-toolbar">
            <span>
              {view === "for-you"
                ? "Your discovery mix"
                : view === "new"
                  ? "Just released"
                  : "From artists you love"}{" "}
              · {visible.length} tracks
            </span>
            <button
              className="button primary"
              onClick={() => p.play(visible, 0, true)}
            >
              <Shuffle size={17} />
              Shuffle mix
            </button>
          </div>
          <div className="card-grid">
            {visible.map((t) => (
              <TrackCard key={t.id} track={t} tracks={visible} />
            ))}
          </div>
        </>
      ) : (
        <Empty
          title="Your favorites start here"
          text="Like a few songs to see more from those artists."
          action={
            <Link to="/trending" className="button primary">
              Explore trending music
            </Link>
          }
        />
      )}
    </div>
  );
}
export function Trending() {
  const [genre, setGenre] = useState("");
  const state = useAsync(
    (signal) => getTrendingTracks(genre || undefined, signal),
    [genre],
  );
  const p = usePlayer();
  return (
    <div className="page">
      <div className="chart-hero">
        <span className="eyebrow">THE SOUND OF RIGHT NOW</span>
        <h1>
          On everyone’s
          <br />
          radar<span className="coral">.</span>
        </h1>
        <p>The most played independent sounds this week.</p>
        <button
          className="button primary"
          disabled={!state.data?.length}
          onClick={() => p.play(state.data)}
        >
          <Play size={18} fill="currentColor" />
          Play the chart
        </button>
        <div className="chart-mark">
          TOP
          <br />
          <span>50</span>
        </div>
      </div>
      <div className="browse-toolbar">
        <h2>Trending tracks</h2>
        <select
          aria-label="Filter chart by genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.name}>{g.name}</option>
          ))}
        </select>
      </div>
      {state.loading ? (
        <Skeleton />
      ) : state.error ? (
        <ErrorState error={state.error} retry={state.retry} />
      ) : (
        <TrackList tracks={state.data || []} />
      )}
    </div>
  );
}
