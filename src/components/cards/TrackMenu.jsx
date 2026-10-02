import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Play,
  ListPlus,
  Heart,
  Plus,
  User,
  Disc3,
  SkipForward,
  Trash2,
} from "lucide-react";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";
import { IconButton, Modal } from "../common/UI";
export default function TrackMenu({ track, playlistId }) {
  const [open, setOpen] = useState(false);
  const p = usePlayer(),
    l = useLibrary(),
    navigate = useNavigate();
  const choose = (fn) => {
    fn();
    setOpen(false);
  };
  return (
    <>
      <IconButton
        label={`More options for ${track.title}`}
        onClick={() => setOpen(true)}
      >
        <MoreHorizontal size={19} />
      </IconButton>
      {open && (
        <Modal title={track.title} onClose={() => setOpen(false)}>
          <div className="track-menu">
            {[
              [Play, "Play", () => p.play([track])],
              [SkipForward, "Play next", () => p.addQueue(track, true)],
              [ListPlus, "Add to queue", () => p.addQueue(track)],
              [
                Heart,
                l.isLiked(track) ? "Remove from Liked Songs" : "Like song",
                () => l.toggleLike(track),
              ],
              [
                Plus,
                "Add to playlist",
                () => l.setDialog({ type: "add", track }),
              ],
              [
                User,
                "Go to artist",
                () => navigate(`/artist/${track.artistId}`),
              ],
              [
                Disc3,
                track.albumId ? "Go to album" : "View release",
                () =>
                  navigate(`/album/${track.albumId || `track-${track.id}`}`),
              ],
              ...(playlistId
                ? [
                    [
                      Trash2,
                      "Remove from playlist",
                      () => l.removeFromPlaylist(playlistId, track.id),
                    ],
                  ]
                : []),
            ].map(([Icon, label, fn]) => (
              <button key={label} onClick={() => choose(fn)}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
