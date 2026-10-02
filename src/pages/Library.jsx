import { Link, useParams } from "react-router-dom";
import {
  Plus,
  Heart,
  Clock3,
  Music2,
  Play,
  Shuffle,
  Pencil,
  Trash2,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import { Empty, Artwork } from "../components/common/UI";
import TrackList from "../components/cards/TrackList";
function PlaylistArtwork({ playlist }) {
  return (
    <div className="playlist-artwork">
      {playlist.songs.length >= 4 ? (
        <div className="art-collage">
          {playlist.songs.slice(0, 4).map((t, i) => (
            <Artwork key={i} src={t.artwork} />
          ))}
        </div>
      ) : playlist.artwork ? (
        <Artwork src={playlist.artwork} />
      ) : (
        <div className="playlist-placeholder">
          <Music2 size={54} />
        </div>
      )}
    </div>
  );
}
export default function Library() {
  const l = useLibrary();
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">THE MUSIC THAT MAKES YOU</span>
          <h1>
            Your little universe<span className="coral">.</span>
          </h1>
          <p className="page-description">
            Every favorite. Every feeling. All in one place.
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => l.setDialog({ type: "create" })}
        >
          <Plus size={18} />
          Create playlist
        </button>
      </div>
      <div className="library-feature-grid">
        <Link className="library-feature liked-feature" to="/liked">
          <Heart size={40} fill="currentColor" />
          <div>
            <h2>Liked songs</h2>
            <p>{l.liked.length} favorites and counting</p>
          </div>
          <Play size={23} fill="currentColor" />
        </Link>
        <Link className="library-feature history-feature" to="/recent">
          <Clock3 size={40} />
          <div>
            <h2>Recently played</h2>
            <p>Pick up where you left off</p>
          </div>
          <Play size={23} fill="currentColor" />
        </Link>
      </div>
      <div className="section-heading">
        <h2>Your playlists</h2>
        <span className="muted">{l.playlists.length} collections</span>
      </div>
      {l.playlists.length ? (
        <div className="card-grid">
          {l.playlists.map((list) => (
            <Link
              key={list.id}
              to={`/playlist/${list.id}`}
              className="album-card"
            >
              <PlaylistArtwork playlist={list} />
              <h3>{list.name}</h3>
              <p>{list.songs.length} tracks · Made by you</p>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="A good playlist starts with you"
          text="Give it a name. Add the songs that feel right."
          action={
            <button
              className="button primary"
              onClick={() => l.setDialog({ type: "create" })}
            >
              <Plus size={18} />
              Make your first playlist
            </button>
          }
        />
      )}
    </div>
  );
}
export function SavedTracks({ type = "liked" }) {
  const l = useLibrary(),
    p = usePlayer();
  const tracks = type === "liked" ? l.liked : l.history;
  const isLiked = type === "liked";
  return (
    <div className="page">
      <section
        className={`saved-hero ${isLiked ? "liked-feature" : "history-feature"}`}
      >
        <div className="saved-symbol">
          {isLiked ? (
            <Heart size={72} fill="currentColor" />
          ) : (
            <Clock3 size={72} />
          )}
        </div>
        <div>
          <span className="eyebrow">YOUR COLLECTION</span>
          <h1>{isLiked ? "Liked songs" : "Recently played"}</h1>
          <p>
            {isLiked
              ? "The ones you keep coming back to."
              : "A soundtrack of where you’ve been."}
          </p>
          <small>
            {tracks.length} tracks · {l.settings.name}
          </small>
        </div>
      </section>
      <div className="entity-actions">
        <button
          className="button primary"
          disabled={!tracks.length}
          onClick={() => p.play(tracks)}
        >
          <Play size={18} fill="currentColor" />
          Play all
        </button>
        <button
          className="button secondary"
          disabled={!tracks.length}
          onClick={() => p.play(tracks, 0, true)}
        >
          <Shuffle size={18} />
          Shuffle all
        </button>
      </div>
      {tracks.length ? (
        <>
          <TrackList tracks={tracks} />
          {!isLiked && (
            <p className="local-note">
              Your 100 most recent tracks, saved on this device.
            </p>
          )}
        </>
      ) : (
        <Empty
          title={
            isLiked ? "Love it? Keep it." : "Your listening story starts here"
          }
          text={
            isLiked
              ? "Tap the heart on any song to save it here."
              : "Play something that speaks to you."
          }
          action={
            <Link className="button primary" to="/discover">
              Find something new
            </Link>
          }
        />
      )}
    </div>
  );
}
export function Playlist() {
  const { id } = useParams();
  const l = useLibrary(),
    p = usePlayer();
  const list = l.playlists.find((a) => a.id === id);
  if (!list)
    return (
      <div className="page">
        <Empty
          title="This playlist isn’t here"
          text="It may have been deleted, or saved on another device."
          action={
            <Link className="button primary" to="/library">
              Back to library
            </Link>
          }
        />
      </div>
    );
  return (
    <div className="page">
      <section className="entity-hero">
        <PlaylistArtwork playlist={list} />
        <div>
          <span className="eyebrow">YOUR PLAYLIST</span>
          <h1>{list.name}</h1>
          <p>
            Made by {l.settings.name} · {list.songs.length} tracks
          </p>
          <small>Created {new Date(list.createdAt).toLocaleDateString()}</small>
        </div>
      </section>
      <div className="entity-actions">
        <button
          className="button primary"
          disabled={!list.songs.length}
          onClick={() => p.play(list.songs)}
        >
          <Play size={18} fill="currentColor" />
          Play playlist
        </button>
        <button
          className="button secondary"
          disabled={!list.songs.length}
          onClick={() => p.play(list.songs, 0, true)}
        >
          <Shuffle size={18} />
          Shuffle
        </button>
        <button
          className="button secondary"
          onClick={() => l.setDialog({ type: "rename", playlist: list })}
        >
          <Pencil size={17} />
          Rename
        </button>
        <button
          className="button danger subtle"
          onClick={() => l.setDialog({ type: "delete", playlist: list })}
        >
          <Trash2 size={17} />
          Delete
        </button>
      </div>
      {list.songs.length ? (
        <TrackList tracks={list.songs} playlistId={id} />
      ) : (
        <Empty
          title="Let’s fill this with good music"
          text="Open a song’s menu and choose Add to playlist."
          action={
            <Link className="button primary" to="/search">
              Find your first track
            </Link>
          }
        />
      )}
    </div>
  );
}
export function Profile() {
  const l = useLibrary();
  const [name, setName] = useState(l.settings.name);
  const total = l.history.reduce((n, t) => n + t.playCount, 0);
  return (
    <div className="page profile-page">
      <span className="eyebrow">YOUR SOUND. YOUR SPACE.</span>
      <h1>
        Hello, {l.settings.name}
        <span className="coral">.</span>
      </h1>
      <p className="page-description">
        A listening space that gets a little more you with every play.
      </p>
      <div className="profile-stats">
        <div>
          <Heart />
          <strong>{l.liked.length}</strong>
          <span>Liked songs</span>
        </div>
        <div>
          <Music2 />
          <strong>{l.playlists.length}</strong>
          <span>Playlists</span>
        </div>
        <div>
          <Headphones />
          <strong>{total}</strong>
          <span>Plays on this device</span>
        </div>
      </div>
      <section className="settings-card">
        <h2>Make yourself at home</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) {
              l.setSettings({ ...l.settings, name: name.trim() });
              l.toast("Looking good. Profile saved.");
            }
          }}
        >
          <label htmlFor="display-name">Your display name</label>
          <input
            id="display-name"
            required
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="button primary">Save profile</button>
        </form>
        <p>
          Your likes, playlists, listening history, and recommendations stay on
          this browser. No account is needed.
        </p>
      </section>
      <section className="settings-card">
        <h2>A few listening shortcuts</h2>
        <div className="shortcut-list">
          <span>
            <kbd>Space</kbd> Play / pause
          </span>
          <span>
            <kbd>←</kbd>
            <kbd>→</kbd> Seek 10 seconds
          </span>
          <span>
            <kbd>M</kbd> Mute / unmute
          </span>
        </div>
      </section>
    </div>
  );
}
