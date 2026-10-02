import { useEffect, useState } from "react";
import {
  searchTracks,
  searchArtists,
  searchAlbums,
} from "../services/musicApi";
export default function useSearch(query) {
  const [state, setState] = useState({
    tracks: [],
    artists: [],
    albums: [],
    loading: false,
    error: null,
  });
  useEffect(() => {
    const ctrl = new AbortController();
    if (!query.trim()) {
      setState({
        tracks: [],
        artists: [],
        albums: [],
        loading: false,
        error: null,
      });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const timer = setTimeout(async () => {
      const results = await Promise.allSettled([
        searchTracks(query, ctrl.signal),
        searchArtists(query, ctrl.signal),
        searchAlbums(query, ctrl.signal),
      ]);
      if (ctrl.signal.aborted) return;
      const [tracks, artists, albums] = results;
      setState({
        tracks: tracks.status === "fulfilled" ? tracks.value : [],
        artists: artists.status === "fulfilled" ? artists.value : [],
        albums: albums.status === "fulfilled" ? albums.value : [],
        loading: false,
        error: results.every((r) => r.status === "rejected")
          ? "Search is unavailable right now. Please try again."
          : null,
        warning: tracks.status === "fulfilled" ? tracks.value.warning : null,
      });
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);
  return state;
}
