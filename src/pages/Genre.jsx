import { useParams, Link } from "react-router-dom";
import { Play, Shuffle, AudioLines } from "lucide-react";
import useAsync from "../hooks/useAsync";
import { genres, moods, getGenreTracks } from "../services/musicApi";
import { GenreTiles } from "./Search";
import { usePlayer } from "../context/PlayerContext";
import { Skeleton, ErrorState, Empty } from "../components/common/UI";
import TrackCard from "../components/cards/TrackCard";
export function Genres() {
  return (
    <div className="page">
      <span className="eyebrow">FOLLOW A FEELING</span>
      <h1>
        What’s your mood<span className="coral">?</span>
      </h1>
      <p className="page-description">
        There’s a whole world between play and pause.
      </p>
      <div className="mood-grid">
        {moods.map((m) => (
          <Link
            className="mood-card"
            key={m.name}
            style={{ "--mood-color": m.color }}
            to={`/genre/${encodeURIComponent(m.genre)}`}
          >
            <AudioLines size={30} />
            <h3>{m.name}</h3>
            <span>A Sona mix</span>
          </Link>
        ))}
      </div>
      <h2>Find your genre</h2>
      <GenreTiles />
    </div>
  );
}
export default function Genre() {
  const { genre } = useParams();
  const p = usePlayer();
  const g = genres.find((g) => g.name === genre) || {
    name: genre,
    color: "#61446f",
    subtitle: "A sound to make your own",
  };
  const state = useAsync((signal) => getGenreTracks(genre, signal), [genre]);
  return (
    <div className="page">
      <div className="genre-hero" style={{ "--genre-color": g.color }}>
        <span className="eyebrow">SONA COLLECTION</span>
        <h1>{g.label || genre}</h1>
        <p>{g.subtitle}</p>
        <div className="hero-actions">
          <button
            className="button primary"
            disabled={!state.data?.length}
            onClick={() => p.play(state.data)}
          >
            <Play size={18} fill="currentColor" />
            Play mix
          </button>
          <button
            className="button secondary"
            disabled={!state.data?.length}
            onClick={() => p.play(state.data, 0, true)}
          >
            <Shuffle size={18} />
            Shuffle
          </button>
        </div>
        <AudioLines className="genre-hero-icon" size={130} />
      </div>
      <h2>The essential mix</h2>
      {state.loading ? (
        <Skeleton cards />
      ) : state.error ? (
        <ErrorState error={state.error} retry={state.retry} />
      ) : state.data?.length ? (
        <div className="card-grid">
          {state.data.map((t) => (
            <TrackCard key={t.id} track={t} tracks={state.data} />
          ))}
        </div>
      ) : (
        <Empty
          title="Quiet here for now"
          text="Explore another genre while this collection grows."
        />
      )}
    </div>
  );
}
