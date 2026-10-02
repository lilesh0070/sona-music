import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, Heart, ListMusic, AudioLines } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { Artwork, IconButton, Empty } from "../components/common/UI";
import { PlayerControls, Progress, Volume } from "../components/player/Player";
import TrackMenu from "../components/cards/TrackMenu";
export default function FullPlayer() {
  const p = usePlayer(),
    l = useLibrary(),
    navigate = useNavigate();
  return (
    <div
      className="full-player"
      style={p.current ? { "--player-bg": `url("${p.current.artwork}")` } : {}}
    >
      <header>
        <IconButton label="Close full player" onClick={() => navigate(-1)}>
          <ChevronDown size={28} />
        </IconButton>
        <div>
          <AudioLines size={17} />
          <span>IN YOUR FREQUENCY</span>
        </div>
        {p.current ? <TrackMenu track={p.current} /> : <span />}
      </header>
      {p.current ? (
        <section className="full-player-content">
          <Artwork
            className="full-art"
            src={p.current.artwork}
            alt={p.current.title}
          />
          <div className="full-track">
            <div>
              <h1>{p.current.title}</h1>
              <Link to={`/artist/${p.current.artistId}`}>
                {p.current.artist}
              </Link>
            </div>
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
                size={25}
                fill={l.isLiked(p.current) ? "currentColor" : "none"}
              />
            </IconButton>
          </div>
          <Progress />
          <PlayerControls large />
          <div className="full-player-bottom">
            <Volume />
            <IconButton label="Open queue" onClick={() => p.setQueueOpen(true)}>
              <ListMusic size={22} />
            </IconButton>
          </div>
          {p.error && <p role="alert">{p.error}</p>}
        </section>
      ) : (
        <Empty
          title="Let the music find you"
          text="Pick a track and settle into your own frequency."
          action={
            <Link className="button primary" to="/discover">
              Discover music
            </Link>
          }
        />
      )}
    </div>
  );
}
