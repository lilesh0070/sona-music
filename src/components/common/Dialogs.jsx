import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Music2, CheckCircle2 } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext";
import { Modal, Artwork } from "./UI";
export default function Dialogs() {
  const l = useLibrary();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const d = l.dialog;
  if (!d) return null;
  const close = () => {
    l.setDialog(null);
    setName("");
  };
  if (d.type === "add")
    return (
      <Modal title="Add to playlist" onClose={close}>
        <div className="playlist-options">
          {l.playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                l.addToPlaylist(p.id, d.track);
                close();
              }}
            >
              <Artwork src={p.artwork} />
              <span>
                {p.name}
                <small>{p.songs.length} tracks</small>
              </span>
              {p.songs.some((t) => t.id === d.track.id) && (
                <CheckCircle2 size={18} />
              )}
            </button>
          ))}
        </div>
        <button
          className="button secondary full"
          onClick={() => l.setDialog({ type: "create", track: d.track })}
        >
          <Plus size={18} />
          Create a new playlist
        </button>
      </Modal>
    );
  if (d.type === "delete")
    return (
      <Modal title="Delete this playlist?" onClose={close}>
        <p>
          “{d.playlist.name}” and its track list will be removed from this
          device.
        </p>
        <div className="modal-actions">
          <button className="button secondary" onClick={close}>
            Keep playlist
          </button>
          <button
            className="button primary"
            onClick={() => {
              l.deletePlaylist(d.playlist.id);
              close();
              navigate("/library");
            }}
          >
            Delete playlist
          </button>
        </div>
      </Modal>
    );
  return (
    <Modal
      title={
        d.type === "rename"
          ? "Rename playlist"
          : "A new place for your favorites"
      }
      onClose={close}
    >
      <div className="playlist-symbol">
        <Music2 size={38} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget)
            .get("playlistName")
            .trim();
          if (!value) return;
          if (d.type === "rename") l.renamePlaylist(d.playlist.id, value);
          else {
            const id = l.createPlaylist(value, d.track);
            navigate(`/playlist/${id}`);
          }
          close();
        }}
      >
        <label className="field-label" htmlFor="playlist-name">
          Playlist name
        </label>
        <input
          id="playlist-name"
          name="playlistName"
          required
          maxLength={80}
          placeholder="My next obsession"
          defaultValue={d.type === "rename" ? d.playlist.name : ""}
        />
        <button className="button primary full" type="submit">
          {d.type === "rename" ? "Save name" : "Create playlist"}
        </button>
      </form>
    </Modal>
  );
}
