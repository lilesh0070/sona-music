import { createContext, useContext, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { recordEvent } from "../services/analytics";
const LibraryContext = createContext();
export function LibraryProvider({ children }) {
  const [liked, setLiked] = useLocalStorage("liked", []),
    [history, setHistory] = useLocalStorage("history", []),
    [playlists, setPlaylists] = useLocalStorage("playlists", []),
    [searches, setSearches] = useLocalStorage("search_history", []),
    [settings, setSettings] = useLocalStorage("settings", { name: "Listener" });
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState(null);
  const toast = (message) => setNotice(message);
  useEffect(() => {
    const handler = (e) => toast(e.detail);
    window.addEventListener("sona:toast", handler);
    return () => window.removeEventListener("sona:toast", handler);
  }, []);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const toggleLike = (t) => {
    const has = liked.some((s) => s.id === t.id);
    setLiked((old) => (has ? old.filter((s) => s.id !== t.id) : [t, ...old]));
    recordEvent(has ? "track_unliked" : "track_liked", t);
    toast(has ? "Removed from Liked Songs" : "Added to Liked Songs");
  };
  const recordPlay = (t) => {
    recordEvent("track_started", t);
    setHistory((h) => {
      const old = h.find((s) => s.id === t.id);
      return [
        { ...t, timestamp: Date.now(), playCount: (old?.playCount || 0) + 1 },
        ...h.filter((s) => s.id !== t.id),
      ].slice(0, 100);
    });
  };
  const createPlaylist = (name, track) => {
    const p = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      artwork: track?.artwork || null,
      songs: track ? [track] : [],
    };
    setPlaylists((old) => [p, ...old]);
    if (track) recordEvent("playlist_added", track);
    toast("Playlist created");
    return p.id;
  };
  const renamePlaylist = (id, name) => {
    setPlaylists((old) =>
      old.map((p) =>
        p.id === id ? { ...p, name: name.trim(), updatedAt: Date.now() } : p,
      ),
    );
    toast("Playlist renamed");
  };
  const deletePlaylist = (id) => {
    setPlaylists((old) => old.filter((p) => p.id !== id));
    toast("Playlist deleted");
  };
  const addToPlaylist = (id, t) => {
    if (playlists.find((p) => p.id === id)?.songs.some((s) => s.id === t.id)) {
      toast("Already in this playlist");
      return;
    }
    setPlaylists((old) =>
      old.map((p) =>
        p.id === id
          ? {
              ...p,
              songs: [...p.songs, t],
              artwork: p.artwork || t.artwork,
              updatedAt: Date.now(),
            }
          : p,
      ),
    );
    recordEvent("playlist_added", t);
    toast("Added to playlist");
  };
  const removeFromPlaylist = (id, tid) => {
    setPlaylists((old) =>
      old.map((p) =>
        p.id === id
          ? {
              ...p,
              songs: p.songs.filter((t) => t.id !== tid),
              updatedAt: Date.now(),
            }
          : p,
      ),
    );
    toast("Removed from playlist");
  };
  const saveSearch = (q) => {
    setSearches((old) =>
      [q, ...old.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(
        0,
        12,
      ),
    );
    recordEvent("search_performed", null, { query: q });
  };
  return (
    <LibraryContext.Provider
      value={{
        liked,
        history,
        playlists,
        searches,
        settings,
        setSettings,
        toggleLike,
        recordPlay,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        saveSearch,
        clearSearches: () => setSearches([]),
        isLiked: (t) => liked.some((s) => s.id === t.id),
        toast,
        notice,
        dialog,
        setDialog,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}
export const useLibrary = () => useContext(LibraryContext);
