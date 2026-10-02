import { Link } from "react-router-dom";
import {
  Play,
  ArrowUpRight,
  AudioLines,
  Headphones,
  Heart,
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import useAsync from "../hooks/useAsync";
import useRecommendations from "../hooks/useRecommendations";
import {
  getTrendingTracks,
  getNewReleases,
  getFavoriteArtistTracks,
  moods,
  genres,
  fallbackArt,
} from "../services/musicApi";
import TrackCard from "../components/cards/TrackCard";
import TrackList from "../components/cards/TrackList";
import Section from "../components/cards/Section";
import { Artwork, Skeleton, ErrorState } from "../components/common/UI";
function ArtistCard({ artist }) {
  return (
    <Link to={`/artist/${artist.artistId}`} className="artist-card">
      <Artwork src={artist.artistImage || artist.artwork} alt={artist.artist} />
      <h3>{artist.artist}</h3>
      <span>Artist</span>
    </Link>
  );
}
export default function Home() {
  const l = useLibrary(),
    p = usePlayer();
  const music = useAsync((signal) => getTrendingTracks(undefined, signal));
  const releases = useAsync((signal) => getNewReleases(signal));
  const recommended = useRecommendations();
  const favoriteTracks = useAsync(
    (signal) => getFavoriteArtistTracks(l.liked, signal),
    [l.liked.map((t) => t.artistId).join()],
  );
  const tracks = music.data || [];
  const artists = [
    ...new Map(tracks.map((t) => [t.artistId, t])).values(),
  ].slice(0, 8);
  const h = new Date().getHours();
  const greeting =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="home-page">
      <div className="greeting-row">
        <div>
          <span className="eyebrow">A LITTLE DISCOVERY. A LOT OF YOU.</span>
          <h1>
            {greeting}
            <span className="coral">.</span>
          </h1>
          <p>Settle in. Your next favorite is closer than you think.</p>
        </div>
        <span className="date-note">
          {new Date().toLocaleDateString("en", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="home-tabs">
        <Link className="pill selected" to="/">
          For you
        </Link>
        <Link className="pill" to="/discover">
          Discover
        </Link>
        <Link className="pill" to="/genres">
          Moods & genres
        </Link>
      </div>
      <div className="feature-layout">
        <section
          className="discovery-hero"
          style={
            tracks[0] ? { "--hero-image": `url("${tracks[0].artwork}")` } : {}
          }
        >
          <div className="hero-shade" />
          <div className="hero-copy">
            <span className="hero-label">
              <span /> THE WEEKLY EDIT
            </span>
            <h2>
              Less scrolling.
              <br />
              More feeling.
            </h2>
            <p>
              A fresh rotation of independent sounds.
              <br />A little familiar. A little unexpected.
            </p>
            <div className="hero-actions">
              <button
                className="button primary"
                disabled={!tracks.length}
                onClick={() => p.play(tracks)}
              >
                <Play size={17} fill="currentColor" />
                Play the mix
              </button>
              <Link className="hero-discover" to="/discover">
                Explore the sounds <ArrowUpRight size={17} />
              </Link>
            </div>
            <span className="hero-meta">
              CURATED FOR THE CURIOUS · UPDATED WEEKLY
            </span>
          </div>
          <div className="hero-art">
            <Artwork src={tracks[0]?.artwork} alt="Weekly edit artwork" />
            <span className="vinyl-label">
              <AudioLines size={15} />
              THE WEEKLY EDIT
            </span>
          </div>
        </section>
        <Link to="/genre/Lo-Fi" className="focus-feature">
          <div className="focus-top">
            <Headphones size={20} />
            <ArrowUpRight size={19} />
          </div>
          <div className="focus-copy">
            <span className="eyebrow">IN YOUR ELEMENT</span>
            <h3>
              A little
              <br />
              headspace.
            </h3>
            <p>Lo-fi sounds for a clear mind.</p>
            <span className="focus-cta">
              Find your focus <Play size={13} fill="currentColor" />
            </span>
          </div>
        </Link>
      </div>
      <section className="quick-section">
        <div className="section-heading">
          <h2>
            {l.history.length
              ? "Pick up where you left off"
              : "Make yourself at home"}
          </h2>
          <Link
            className="see-all"
            to={l.history.length ? "/recent" : "/library"}
          >
            {l.history.length ? "History" : "Your library"}
          </Link>
        </div>
        <div className="quick-grid">
          {l.history.length ? (
            l.history.slice(0, 6).map((t) => (
              <button
                className="quick-card"
                key={t.id}
                onClick={() =>
                  p.play(
                    l.history,
                    l.history.findIndex((s) => s.id === t.id),
                  )
                }
              >
                <Artwork src={t.artwork} />
                <span>
                  {t.title}
                  <small>{t.artist}</small>
                </span>
                <Play size={18} fill="currentColor" />
              </button>
            ))
          ) : (
            <>
              <Link className="quick-card" to="/liked">
                <span className="quick-icon liked-cover">
                  <Heart size={24} fill="currentColor" />
                </span>
                <span>
                  Liked songs<small>All your favorites, together</small>
                </span>
                <Play size={18} />
              </Link>
              {moods.slice(0, 2).map((m) => (
                <Link
                  className="quick-card"
                  key={m.name}
                  to={`/genre/${encodeURIComponent(m.genre)}`}
                >
                  <span className="quick-icon" style={{ background: m.color }}>
                    <AudioLines size={24} />
                  </span>
                  <span>
                    {m.name}
                    <small>A mood worth staying in</small>
                  </span>
                  <Play size={18} />
                </Link>
              ))}
            </>
          )}
        </div>
      </section>
      {music.loading ? (
        <Skeleton cards />
      ) : music.error ? (
        <ErrorState error={music.error} retry={music.retry} />
      ) : (
        <>
          <Section
            title="Made for your kind of listening"
            subtitle={
              l.history.length || l.liked.length
                ? "A fresh mix, shaped by the music you love."
                : "A few new favorites to get you started."
            }
            to="/discover"
          >
            {(recommended.data || tracks).slice(0, 10).map((t) => (
              <TrackCard
                key={t.id}
                track={t}
                tracks={recommended.data || tracks}
              />
            ))}
          </Section>
          <Section
            title="Trending right now"
            subtitle="The sounds everyone’s coming back to."
            to="/trending"
          >
            {tracks.slice(0, 10).map((t) => (
              <TrackCard key={t.id} track={t} tracks={tracks} />
            ))}
          </Section>
          <Section
            title="Meet your next favorite artist"
            to="/discover?view=artists"
          >
            {artists.map((a) => (
              <ArtistCard key={a.artistId} artist={a} />
            ))}
          </Section>
        </>
      )}
      <Section title="There’s a mix for every mood" to="/genres">
        {moods.map((m, i) => (
          <Link
            to={`/genre/${encodeURIComponent(m.genre)}`}
            className="mood-card"
            key={m.name}
            style={{ "--mood-color": m.color }}
          >
            <span className="mood-number">0{i + 1} / SONA MIX</span>
            <AudioLines size={40} />
            <h3>{m.name}</h3>
            <span>
              Find your flow <ArrowUpRight size={15} />
            </span>
          </Link>
        ))}
      </Section>
      {releases.data?.length > 0 && (
        <Section
          title="Fresh out of the studio"
          subtitle="New releases. New obsessions."
          to="/discover?view=new"
        >
          {releases.data.slice(0, 10).map((t) => (
            <TrackCard key={t.id} track={t} tracks={releases.data} />
          ))}
        </Section>
      )}
      {tracks.length > 0 && (
        <section className="music-section">
          <div className="section-heading">
            <h2>In heavy rotation</h2>
            <Link className="see-all" to="/trending">
              View top tracks
            </Link>
          </div>
          <TrackList tracks={tracks.slice(0, 5)} compact />
        </section>
      )}
      {l.liked.length > 0 && (
        <Section title={`Because you liked ${l.liked[0].title}`} to="/discover">
          {(recommended.data || [])
            .filter((t) => !l.isLiked(t))
            .slice(0, 8)
            .map((t) => (
              <TrackCard key={t.id} track={t} tracks={recommended.data} />
            ))}
        </Section>
      )}
      {favoriteTracks.data?.length > 0 && (
        <Section
          title="More from artists you love"
          to="/discover?view=favorites"
        >
          {(favoriteTracks.data || []).slice(0, 8).map((t) => (
            <TrackCard key={t.id} track={t} tracks={favoriteTracks.data} />
          ))}
        </Section>
      )}
      <Section title="Find a different frequency" to="/genres">
        {genres.slice(0, 6).map((g) => (
          <Link
            className="genre-mini"
            style={{ background: g.color }}
            key={g.name}
            to={`/genre/${encodeURIComponent(g.name)}`}
          >
            <h3>{g.label || g.name}</h3>
            <span>{g.subtitle}</span>
            <ArrowUpRight size={19} />
          </Link>
        ))}
      </Section>
    </div>
  );
}
