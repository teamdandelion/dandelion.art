import { useEffect, useState } from "react";

export default function OfflineStatus() {
  const [status, setStatus] = useState("Preparing offline reference…");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [update, setUpdate] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setStatus("Offline storage is unavailable in this browser.");
      return;
    }
    let disposed = false;
    let reg: ServiceWorkerRegistration | undefined;
    let originalController = navigator.serviceWorker.controller;
    const refresh = () => {
      if (disposed) return;
      setUpdate(Boolean(reg?.waiting));
      if (reg?.active)
        setStatus(
          navigator.onLine ? "Available offline" : "Offline · reference ready",
        );
    };
    const watch = () => {
      const worker = reg?.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "redundant" && !reg?.active && !disposed)
          setStatus("Offline download failed. Reconnect and reload to retry.");
        refresh();
      });
    };
    navigator.serviceWorker
      .register("/music/sw.js", { scope: "/music/", updateViaCache: "none" })
      .then((value) => {
        if (disposed) return;
        reg = value;
        setRegistration(value);
        reg.addEventListener("updatefound", watch);
        watch();
        refresh();
        navigator.serviceWorker.ready.then(refresh);
      })
      .catch(() => {
        if (!disposed)
          setStatus(
            "Offline download unavailable. Reconnect and reload to retry.",
          );
      });
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    const controllerChanged = () => {
      // An accepted update switches every open music window to the same build.
      if (
        originalController &&
        navigator.serviceWorker.controller !== originalController
      )
        location.reload();
      else {
        originalController = navigator.serviceWorker.controller;
        refresh();
      }
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      controllerChanged,
    );
    return () => {
      disposed = true;
      reg?.removeEventListener("updatefound", watch);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        controllerChanged,
      );
    };
  }, []);
  return (
    <aside className="music-offline">
      <output>{status}</output>
      {update && (
        <button
          type="button"
          onClick={() => {
            registration?.waiting?.postMessage("APPLY_UPDATE");
          }}
        >
          Update available · reload
        </button>
      )}
      <details>
        <summary>Use offline on iPhone</summary>
        <p>
          In Safari, use Share → Add to Home Screen. Open the home-screen app
          online and wait for “Available offline” before switching to airplane
          mode. The music reference works offline; Home and Art are not
          downloaded.
        </p>
        <button
          type="button"
          disabled={!registration?.active}
          onClick={async () => {
            try {
              const persisted = await navigator.storage?.persist?.();
              setStorageMessage(
                persisted
                  ? "Persistent storage enabled."
                  : "Your browser manages offline storage. Keep a backup of personal content.",
              );
            } catch {
              setStorageMessage(
                "Storage persistence could not be requested. The reference remains cached.",
              );
            }
          }}
        >
          Keep offline storage
        </button>
        <p>{storageMessage}</p>
      </details>
    </aside>
  );
}
