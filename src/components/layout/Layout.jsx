import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  House,
  Search,
  Compass,
  TrendingUp,
  Grid2X2,
  Library,
  Heart,
  Clock3,
  Plus,
  ChevronLeft,
  ChevronRight,
  AudioLines,
  User,
  ArrowUpRight,
  Music2,
} from "lucide-react";
import { useLibrary } from "../../context/LibraryContext";
import { usePlayer } from "../../context/PlayerContext";
import { IconButton } from "../common/UI";
const primary = [
  ["/", House, "Home"],
  ["/search", Search, "Search"],
  ["/discover", Compass, "Discover"],
  ["/trending", TrendingUp, "Trending"],
  ["/genres", Grid2X2, "Genres & moods"],
];
const personal = [
  ["/library", Library, "Your library"],
  ["/liked", Heart, "Liked songs"],
  ["/recent", Clock3, "Recently played"],
];
function NavItems({ items }) {
  return items.map(([url, Icon, title]) => (
    <NavLink
      key={url}
      end={url === "/"}
      to={url}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
    >
      <Icon size={20} />
      <span>{title}</span>
    </NavLink>
  ));
}
export function Logo() {
  return (
    <Link to="/" className="brand">
      <span className="brand-icon">
        <AudioLines size={27} strokeWidth={2.6} />
      </span>
      sona<span className="brand-dot">.</span>
    </Link>
  );
}
export default function Layout({ children }) {
  const l = useLibrary(),
    p = usePlayer(),
    navigate = useNavigate(),
    location = useLocation();
  const [query, setQuery] = useState("");
  useEffect(() => {
    document.querySelector(".main-scroll")?.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <div className="nav-group">
          <span className="nav-label">DISCOVER</span>
          <NavItems items={primary} />
        </div>
        <div className="nav-group">
          <span className="nav-label">YOUR SPACE</span>
          <NavItems items={personal} />
        </div>
        <div className="playlists-heading">
          <span className="nav-label">PLAYLISTS</span>
          <IconButton
            label="Create playlist"
            onClick={() => l.setDialog({ type: "create" })}
          >
            <Plus size={17} />
          </IconButton>
        </div>
        <div className="sidebar-playlists">
          {l.playlists.map((list) => (
            <Link key={list.id} to={`/playlist/${list.id}`}>
              <Music2 size={16} />
              <span>{list.name}</span>
            </Link>
          ))}
          {!l.playlists.length && <p>Your next great mix starts here.</p>}
        </div>
        <button
          className="create-playlist"
          onClick={() => l.setDialog({ type: "create" })}
        >
          <Plus size={18} />
          <span>Create playlist</span>
        </button>
        <div className="sidebar-bottom">
          <div className="listening-note">
            <AudioLines size={22} />
            <div>
              Made for your ears.
              <small>Independent sounds. Endless discovery.</small>
            </div>
          </div>
          <a href="https://audius.co" target="_blank" rel="noreferrer">
            Music from Audius
            <ArrowUpRight size={13} />
          </a>
        </div>
      </aside>
      <div className="main-scroll">
        <header className="topbar">
          <div className="history-buttons">
            <IconButton label="Go back" onClick={() => navigate(-1)}>
              <ChevronLeft size={21} />
            </IconButton>
            <IconButton label="Go forward" onClick={() => navigate(1)}>
              <ChevronRight size={21} />
            </IconButton>
          </div>
          <form
            className="top-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/search?q=${encodeURIComponent(query)}`);
            }}
          >
            <Search size={17} />
            <input
              aria-label="Search music"
              placeholder="What do you want to listen to?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>/</kbd>
          </form>
          <span className="top-note">YOUR SOUND. YOUR SPACE.</span>
          <Link
            className="profile-button"
            to="/profile"
            aria-label="Open profile"
          >
            {l.settings.name.slice(0, 1).toUpperCase()}
          </Link>
        </header>
        <main>{children}</main>
        <footer className="content-footer">
          <Logo />
          <span>Find your frequency.</span>
          <span>Music, on your terms.</span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          ["/", House, "Home"],
          ["/search", Search, "Search"],
          ["/library", Library, "Library"],
          ["/liked", Heart, "Liked"],
          ["/profile", User, "Profile"],
        ].map(([url, Icon, label]) => (
          <NavLink end={url === "/"} to={url} key={url}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
