import { useEffect, useState } from "react";
import { Download, RefreshCw, Github, CheckCircle2 } from "lucide-react";
import {
  APP_VERSION,
  REPOSITORY,
  APK_DOWNLOAD,
  ANDROID_VERSION,
  checkAndroidUpdate,
  checkUpdate,
  applyUpdate,
  installApp,
  canInstall,
} from "../services/appUpdates";
import { storageService as storage } from "../services/storageService";
import { useLibrary } from "../context/LibraryContext";
import { refreshIndianCatalog } from "../services/indianMusic";
export default function Updates() {
  const [checking, setChecking] = useState(false),
    [latest, setLatest] = useState(null),
    [message, setMessage] = useState(""),
    [installable, setInstallable] = useState(canInstall),
    [key, setKey] = useState(() => storage.read("youtube_key", ""));
  const l = useLibrary();
  const [androidMessage, setAndroidMessage] = useState("");
  const [androidChecking, setAndroidChecking] = useState(false);
  const [feedMessage, setFeedMessage] = useState(""),
    [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const changed = () => setInstallable(canInstall());
    window.addEventListener("vibe:install-ready", changed);
    return () => window.removeEventListener("vibe:install-ready", changed);
  }, []);
  const check = async () => {
    setChecking(true);
    setMessage("");
    try {
      const result = await checkUpdate();
      setLatest(result);
      setMessage(
        result.available
          ? "A new Vibe update is ready."
          : "You have the latest version of Vibe.",
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setChecking(false);
    }
  };
  return (
    <div className="page updates-page">
      <span className="eyebrow">ALWAYS IN YOUR VIBE</span>
      <h1>
        Updates & downloads<span className="coral">.</span>
      </h1>
      <p className="page-description">
        Keep Vibe current. Your likes, playlists and listening history stay on
        this device.
      </p>
      <section className="settings-card">
        <div className="update-version">
          <CheckCircle2 />
          <div>
            <h2>Vibe {APP_VERSION}</h2>
            <p>Automatic Indian music catalog · YouTube + Audius</p>
          </div>
        </div>
        <div className="update-actions">
          <button
            className="button primary"
            disabled={checking}
            onClick={check}
          >
            <RefreshCw size={18} />
            {checking ? "Checking…" : "Check for updates"}
          </button>
          {latest?.available && (
            <button className="button secondary" onClick={applyUpdate}>
              Update & restart
            </button>
          )}
        </div>
        <p role="status">
          {message ||
            "New versions arrive here after they are published on GitHub."}
        </p>
        {latest?.available && <p>Restart will stop current playback.</p>}
      </section>
      <section className="settings-card">
        <h2>Android APK</h2>
        <p>
          {ANDROID_VERSION
            ? `Installed Android app: Vibe ${ANDROID_VERSION}`
            : "Download Vibe for Android 8.0 or newer."}
        </p>
        <p>
          Web updates arrive through Check for updates above. Android package
          updates download from GitHub and install after Android asks for
          confirmation. Keep the existing app installed to preserve its library.
        </p>
        <div className="update-actions">
          <a className="button primary" href={APK_DOWNLOAD}>
            <Download size={18} />
            Download Android APK
          </a>
          {ANDROID_VERSION && (
            <button
              className="button secondary"
              disabled={androidChecking}
              onClick={async () => {
                setAndroidChecking(true);
                try {
                  const result = await checkAndroidUpdate();
                  setAndroidMessage(
                    result.available
                      ? `Android ${result.version} is ready. Download the APK and install it to update.`
                      : `Android app ${ANDROID_VERSION} is up to date.`,
                  );
                } catch (e) {
                  setAndroidMessage(e.message);
                } finally {
                  setAndroidChecking(false);
                }
              }}
            >
              {androidChecking ? "Checking…" : "Check Android updates"}
            </button>
          )}
        </div>
        <p role="status">{androidMessage}</p>
      </section>
      <section className="settings-card">
        <h2>Take Vibe with you</h2>
        <p>
          Install Vibe as an app on your phone or computer. Music playback
          requires an internet connection.
        </p>
        <div className="update-actions">
          {installable && (
            <button
              className="button primary"
              onClick={async () => {
                await installApp();
                setInstallable(canInstall());
              }}
            >
              <Download size={18} />
              Install Vibe
            </button>
          )}
          <a
            className="button secondary"
            href={REPOSITORY + "/archive/refs/heads/main.zip"}
          >
            <Download size={18} />
            Download latest project
          </a>
          <a
            className="button secondary"
            href={REPOSITORY}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
            GitHub repository
          </a>
        </div>
        {!installable && !ANDROID_VERSION && (
          <p>
            Chrome / Edge: browser menu → Install app. iPhone: Safari → Share →
            Add to Home Screen. Already installed? Use Check for updates above.
          </p>
        )}
      </section>
      <section className="settings-card">
        <h2>Your Indian music catalog</h2>
        <p>
          Hindi, Punjabi and Haryanvi music appears automatically from music
          channels on YouTube through the free rss2json API. The app checks
          feeds hourly while in use. Songs play in the official visible YouTube
          player; some videos may be unavailable in your region or have
          embedding disabled.
        </p>
        <button
          className="button secondary"
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            try {
              const tracks = await refreshIndianCatalog();
              setFeedMessage(
                `${tracks.length} music entries ready. Feed providers may cache results.`,
              );
            } catch (e) {
              setFeedMessage(e.message);
            } finally {
              setRefreshing(false);
            }
          }}
        >
          {refreshing ? "Refreshing music…" : "Refresh music catalog"}
        </button>
        <p role="status">{feedMessage}</p>
        <p>
          Want search across the wider YouTube music catalog? Add a free YouTube
          Data API key. The default catalog works without a key or pasted song
          links.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            storage.write("youtube_key", key.trim());
            l.toast("YouTube search settings saved");
          }}
        >
          <label htmlFor="youtube-key">Optional browser API key</label>
          <input
            id="youtube-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            placeholder="YouTube Data API v3 key"
          />
          <button className="button primary">Save search settings</button>
        </form>
        <p>
          Restrict the key to YouTube Data API v3 and HTTP referrer
          https://lilesh0070.github.io/*. This browser key stays on your device.
          Never paste a GitHub token or private server credential.
        </p>
        <a
          className="text-button"
          href="https://developers.google.com/youtube/v3/getting-started"
          target="_blank"
          rel="noreferrer"
        >
          YouTube API setup guide ↗
        </a>
      </section>
    </div>
  );
}
