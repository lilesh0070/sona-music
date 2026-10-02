import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Play, Shuffle, CheckCircle2 } from "lucide-react";
import useAsync from "../hooks/useAsync";
import {
  getArtist,
  getArtistTracks,
  getArtistAlbums,
  getGenreTracks,
} from "../services/musicApi";
import { recordEvent } from "../services/analytics";
import { usePlayer } from "../context/PlayerContext";
import { compact } from "../utils/formatTime";
import { Artwork, Skeleton, ErrorState, Empty } from "../components/common/UI";
import TrackList from "../components/cards/TrackList";
import TrackCard from "../components/cards/TrackCard";
import Section from "../components/cards/Section";
export default function Artist() {
  const { id } = useParams();
  const p = usePlayer();
  const state = useAsync(
    async (signal) => {
      const [raw, tracks, albums] = await Promise.all([
        getArtist(id, signal),
        getArtistTracks(id, signal),
        getArtistAlbums(id, signal).catch(() => []),
      ]);
      const a = Array.isArray(raw) ? raw[0] : raw;
      const related = tracks[0]
        ? await getGenreTracks(tracks[0].genre, signal).catch(() => [])
        : [];
      return {
        a,
        tracks,
        albums: albums || [],
        related: related.filter((t) => t.artistId !== id),
      };
    },
    [id],
  );
  useEffect(() => {
    recordEvent("artist_opened", null, { artistId: id });
  }, [id]);
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
  const { a, tracks, albums, related } = state.data;
  return (
    <div className="page">
      <section
        className="artist-hero"
        style={{
          "--artist-bg": `url("${a.cover_photo?.["2000x"] || a.profile_picture?.["480x480"] || ""}")`,
        }}
      >
        <div className="artist-hero-shade" />
        <div className="artist-hero-copy">
          <span className="eyebrow">
            {a.is_verified && <CheckCircle2 size={15} />} ARTIST
          </span>
          <h1>{a.name}</h1>
          <p>
            {compact(a.follower_count)} followers · {tracks.length} available
            tracks
          </p>
        </div>
      </section>
      <div className="entity-actions">
        <button
          className="button primary"
          disabled={!tracks.length}
          onClick={() => p.play(tracks)}
        >
          <Play size={18} fill="currentColor" />
          Play
        </button>
        <button
          className="button secondary"
          disabled={!tracks.length}
          onClick={() => p.play(tracks, 0, true)}
        >
          <Shuffle size={18} />
          Shuffle
        </button>
      </div>
      <h2>Popular tracks</h2>
      {tracks.length ? (
        <TrackList tracks={tracks} />
      ) : (
        <Empty
          title="No available tracks"
          text="This artist has no free, streamable tracks right now."
        />
      )}
      {albums.length > 0 && (
        <Section title="Albums">
          {albums.map((a) => (
            <Link key={a.id} to={`/album/${a.id}`} className="album-card">
              <Artwork src={a.artwork?.["480x480"]} />
              <h3>{a.playlist_name}</h3>
              <p>Album</p>
            </Link>
          ))}
        </Section>
      )}
      <section className="about-artist">
        <Artwork src={a.profile_picture?.["480x480"]} alt={a.name} />
        <div>
          <span className="eyebrow">BEHIND THE SOUND</span>
          <h2>About {a.name}</h2>
          <p>
            {a.bio || "Explore the music and discover the artist behind it."}
          </p>
          <a
            href={`https://audius.co/${a.handle}`}
            target="_blank"
            rel="noreferrer"
          >
            Meet the artist on Audius
          </a>
        </div>
      </section>
      {related.length > 0 && (
        <Section title="In the same frequency">
          {related.slice(0, 8).map((t) => (
            <TrackCard key={t.id} track={t} tracks={related} />
          ))}
        </Section>
      )}
    </div>
  );
}
