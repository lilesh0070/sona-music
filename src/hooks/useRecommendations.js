import useAsync from "./useAsync";
import { useLibrary } from "../context/LibraryContext";
import { getRecommendations } from "../services/musicApi";
import { storageService } from "../services/storageService";
export default function useRecommendations() {
  const { liked, history, playlists, searches } = useLibrary();
  return useAsync(
    (signal) =>
      getRecommendations(
        {
          liked,
          history,
          playlists,
          searches,
          stats: storageService.read("preferences", {}),
        },
        signal,
      ),
    [liked.length, history[0]?.id, playlists.length, searches[0]],
  );
}
