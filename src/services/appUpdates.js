import { isNewerVersion } from "../utils/versions";
import { version } from "../../package.json";
export const APP_VERSION = version;
export const REPOSITORY = "https://github.com/lilesh0070/vibe";
export const APK_DOWNLOAD = REPOSITORY + "/releases/latest/download/Vibe.apk";
export const ANDROID_VERSION =
  navigator.userAgent.match(/VibeAndroid\/(\d+\.\d+\.\d+)/)?.[1] || null;
let installPrompt;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  window.dispatchEvent(new Event("vibe:install-ready"));
});
export const canInstall = () => Boolean(installPrompt);
export async function installApp() {
  if (!installPrompt) return false;
  await installPrompt.prompt();
  const choice = await installPrompt.userChoice;
  installPrompt = null;
  return choice.outcome === "accepted";
}
export async function checkAndroidUpdate() {
  const response = await fetch(
    "https://api.github.com/repos/lilesh0070/vibe/releases/latest",
    {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    },
  );
  if (!response.ok)
    throw Error(
      "Could not check Android updates. Use Download Android APK to get the latest release.",
    );
  const release = await response.json();
  const asset = release.assets?.find((a) => a.name === "Vibe.apk");
  const latestVersion = release.tag_name?.replace(/^v/, "");
  if (!asset || !/^\d+\.\d+\.\d+$/.test(latestVersion))
    throw Error("No Android APK release is available yet.");
  return {
    version: latestVersion,
    available: isNewerVersion(latestVersion, ANDROID_VERSION),
  };
}
export async function registerApp() {
  if (!("serviceWorker" in navigator)) return;
  try {
    return await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      { updateViaCache: "none" },
    );
  } catch {
    return null;
  }
}
export async function checkUpdate() {
  const r = await fetch(
    `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`,
    { cache: "no-store" },
  );
  if (!r.ok) throw Error("Update service could not be reached. Try again.");
  const latest = await r.json();
  const registration = await navigator.serviceWorker?.getRegistration();
  await registration?.update();
  const current = document
    .querySelector('script[type="module"][src]')
    ?.getAttribute("src")
    ?.split("/")
    .pop();
  const currentRevision = document.querySelector(
    'meta[name="vibe-build"]',
  )?.content;
  return {
    ...latest,
    available:
      latest.version !== APP_VERSION ||
      (latest.revision && latest.revision !== currentRevision) ||
      (latest.entry && latest.entry !== current) ||
      Boolean(registration?.waiting),
  };
}
export async function applyUpdate() {
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration?.waiting) {
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  } else {
    const url = new URL(window.location.href);
    url.searchParams.set("updated", Date.now());
    window.location.replace(url.href);
  }
}
