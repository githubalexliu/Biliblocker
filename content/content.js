(() => {
  // Toggle hiding home feed (feed2).
  const KEY_HIDE_HOME_FEED = "hideHomeFeed";
  const STYLE_ID_HIDE_FEED2 = "biliblocker-hide-feed2";
  let enabled = true;

  function getApi() {
    return globalThis.browser ?? globalThis.chrome;
  }

  async function storageGet(key) {
    const api = getApi();
    if (!api?.storage?.local?.get) return {};
    const res = api.storage.local.get(key);
    if (res && typeof res.then === "function") return await res;
    return await new Promise((resolve) => api.storage.local.get(key, resolve));
  }

  function setFeed2Hidden(hidden) {
    const existing = document.getElementById(STYLE_ID_HIDE_FEED2);
    if (!hidden) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    const style = document.createElement("style");
    style.id = STYLE_ID_HIDE_FEED2;
    style.textContent = `.feed2 { display: none !important; }`;
    document.documentElement.appendChild(style);
  }

  async function initHideHomeFeedSetting() {
    const stored = await storageGet(KEY_HIDE_HOME_FEED);
    const storedEnabled =
      typeof stored?.[KEY_HIDE_HOME_FEED] === "boolean"
        ? stored[KEY_HIDE_HOME_FEED]
        : true;

    applyEnabled(!!storedEnabled);
  }

  function initMessageListener() {
    const api = getApi();
    if (!api?.runtime?.onMessage?.addListener) return;
    api.runtime.onMessage.addListener((msg) => {
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "SET_HIDE_HOME_FEED") {
        applyEnabled(!!msg.enabled);
      }
    });
  }

  function applyEnabled(nextEnabled) {
    enabled = !!nextEnabled;
    setFeed2Hidden(enabled);
  }

  function init() {
    initMessageListener();
    initHideHomeFeedSetting();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();



