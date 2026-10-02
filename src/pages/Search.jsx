import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X, Clock3, Play } from "lucide-react";
import useSearch from "../hooks/useSearch";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import { genres } from "../services/musicApi";
import TrackList from "../components/cards/TrackList";
import {
  Artwork,
  Empty,
  Skeleton,
  ErrorState,
  IconButton,
} from "../components/common/UI";
export function GenreTiles({ items = genres }) {
  return (
    <div className="genre-grid">
      {items.map((g, i) => (
        <Link
          className="genre-tile"
          to={`/genre/${encodeURIComponent(g.name)}`}
          style={{ background: g.color }}
          key={g.name}
        >
          <span>VIBE COLLECTION / {String(i + 1).padStart(2, "0")}</span>
          <h3>{g.label || g.name}</h3>
          <p>{g.subtitle}</p>
          <div className="genre-disc">
            <span />
          </div>
        </Link>
      ))}
    </div>
  );
}
export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [tab, setTab] = useState("All");
  const [retry, setRetry] = useState(0);
  const result = useSearch(query + (retry ? " ".repeat(retry) : ""));
  const l = useLibrary(),
    p = usePlayer();
  useEffect(() => {
    if (query.trim()) {
      const t = setTimeout(() => l.saveSearch(query.trim()), 1000);
      return () => clearTimeout(t);
    }
  }, [query]);
  const matchingGenres = genres.filter((g) =>
    (g.label || g.name).toLowerCase().includes(query.toLowerCase()),
  );
  const lists = l.playlists.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  const empty =
    !result.tracks.length &&
    !result.artists.length &&
    !result.albums.length &&
    !matchingGenres.length &&
    !lists.length;
  return (
    <div className="page search-page">
      <span className="eyebrow">A WORLD OF SOUND</span>
      <h1>
        Find your next obsession<span className="coral">.</span>
      </h1>
      <div className="large-search">
        <SearchIcon size={23} />
        <input
          aria-label="Search songs, artists, albums or genres"
          placeholder="Songs, artists, albums, or a feeling…"
          value={query}
          onChange={(e) =>
            setParams(e.target.value ? { q: e.target.value } : {}, {
              replace: true,
            })
          }
        />
        {query && (
          <IconButton label="Clear search" onClick={() => setParams({})}>
            <X size={20} />
          </IconButton>
        )}
      </div>
      <p className="catalog-notice">
        Automatic Hindi, Punjabi & Haryanvi catalog + Audius.{" "}
        <Link to="/updates">Enable wider YouTube search</Link>
      </p>
      {result.warning && (
        <p className="catalog-notice" role="status">
          YouTube search: {result.warning}
        </p>
      )}
      {!query ? (
        <>
          <div className="section-heading">
            <h2>Recent searches</h2>
            {l.searches.length > 0 && (
              <button className="text-button" onClick={l.clearSearches}>
                Clear history
              </button>
            )}
          </div>
          <div className="search-chips">
            {l.searches.length ? (
              l.searches.map((s) => (
                <button key={s} onClick={() => setParams({ q: s })}>
                  <Clock3 size={15} />
                  {s}
                </button>
              ))
            ) : (
              <p className="muted">
                Try an artist you love, or start with a genre below.
              </p>
            )}
          </div>
          <h2>Browse all</h2>
          <GenreTiles />
        </>
      ) : (
        <>
          <div
            className="filter-tabs"
            role="tablist"
            aria-label="Search filters"
          >
            {["All", "Songs", "Artists", "Albums", "Playlists"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`pill ${tab === t ? "selected" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {result.loading ? (
            <Skeleton />
          ) : result.error ? (
            <ErrorState
              error={result.error}
              retry={() => setRetry((n) => n + 1)}
            />
          ) : empty ? (
            <Empty
              title={`No matches for “${query}”`}
              text="Try a different spelling, artist, or genre. The default catalog includes recent Indian releases and independent music. Enable wider YouTube search in Updates."
            />
          ) : (
            <>
              {(tab === "All" || tab === "Songs") && (
                <section className="music-section">
                  <h2>Songs</h2>
                  {result.tracks.length ? (
                    <TrackList
                      tracks={result.tracks.slice(0, tab === "All" ? 8 : 48)}
                    />
                  ) : (
                    <p className="muted">No songs found.</p>
                  )}
                </section>
              )}
              {(tab === "All" || tab === "Artists") && (
                <section className="music-section">
                  <h2>Artists</h2>
                  <div className="card-grid">
                    {result.artists.map((a) => (
                      <Link
                        className="artist-card"
                        key={a.id}
                        to={`/artist/${a.id}`}
                      >
                        <Artwork
                          src={a.profile_picture?.["480x480"]}
                          alt={a.name}
                        />
                        <h3>{a.name}</h3>
                        <span>Artist</span>
                      </Link>
                    ))}
                  </div>
                  {!result.artists.length && (
                    <p className="muted">No artists found.</p>
                  )}
                </section>
              )}
              {(tab === "All" || tab === "Albums") && (
                <section className="music-section">
                  <h2>Albums</h2>
                  <div className="card-grid">
                    {result.albums.map((a) => (
                      <Link
                        className="album-card"
                        key={a.id}
                        to={`/album/${a.id}`}
                      >
                        <Artwork
                          src={a.artwork?.["480x480"]}
                          alt={a.playlist_name}
                        />
                        <h3>{a.playlist_name}</h3>
                        <p>{a.user?.name}</p>
                      </Link>
                    ))}
                  </div>
                  {!result.albums.length && (
                    <p className="muted">No albums found.</p>
                  )}
                </section>
              )}
              {(tab === "All" || tab === "Playlists") && (
                <section className="music-section">
                  <h2>Your playlists</h2>
                  <div className="card-grid">
                    {lists.map((a) => (
                      <Link
                        className="album-card"
                        key={a.id}
                        to={`/playlist/${a.id}`}
                      >
                        <Artwork src={a.artwork} />
                        <h3>{a.name}</h3>
                        <p>{a.songs.length} songs</p>
                      </Link>
                    ))}
                  </div>
                  {!lists.length && (
                    <p className="muted">
                      No matching playlists on this device.
                    </p>
                  )}
                </section>
              )}
              {tab === "All" && matchingGenres.length > 0 && (
                <section>
                  <h2>Genres</h2>
                  <GenreTiles items={matchingGenres} />
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
