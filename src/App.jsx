import { lazy, Suspense, Component } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LibraryProvider, useLibrary } from "./context/LibraryContext";
import { PlayerProvider } from "./context/PlayerContext";
import Layout from "./components/layout/Layout";
import Player from "./components/player/Player";
import Dialogs from "./components/common/Dialogs";
import { Skeleton } from "./components/common/UI";
const Updates = lazy(() => import("./pages/Updates"));
const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const Discover = lazy(() => import("./pages/Discover"));
const Trending = lazy(() =>
  import("./pages/Discover").then((m) => ({ default: m.Trending })),
);
const Genre = lazy(() => import("./pages/Genre"));
const Genres = lazy(() =>
  import("./pages/Genre").then((m) => ({ default: m.Genres })),
);
const Artist = lazy(() => import("./pages/Artist"));
const Album = lazy(() => import("./pages/Album"));
const Library = lazy(() => import("./pages/Library"));
const Liked = lazy(() =>
  import("./pages/Library").then((m) => ({
    default: () => <m.SavedTracks type="liked" />,
  })),
);
const Recent = lazy(() =>
  import("./pages/Library").then((m) => ({
    default: () => <m.SavedTracks type="recent" />,
  })),
);
const Playlist = lazy(() =>
  import("./pages/Library").then((m) => ({ default: m.Playlist })),
);
const Profile = lazy(() =>
  import("./pages/Library").then((m) => ({ default: m.Profile })),
);
const FullPlayer = lazy(() => import("./pages/FullPlayer"));
const NotFound = lazy(() => import("./pages/NotFound"));
class ErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty-state">
        <h1>Something interrupted the music.</h1>
        <p>Your saved favorites are still here.</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Reload Vibe
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Surface() {
  const l = useLibrary();
  return (
    <>
      <Layout>
        <Suspense
          fallback={
            <div className="page">
              <Skeleton cards />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/genre/:genre" element={<Genre />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/album/:id" element={<Album />} />
            <Route path="/library" element={<Library />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/recent" element={<Recent />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/player" element={<FullPlayer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      <Player />
      <Dialogs />
      {l.notice && (
        <div className="toast" role="status">
          <span className="toast-dot" />
          {l.notice}
        </div>
      )}
    </>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <LibraryProvider>
          <PlayerProvider>
            <Surface />
          </PlayerProvider>
        </LibraryProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
