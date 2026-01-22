(() => {
  // Toggle hiding home feed (feed2), sidebar (rcmd-tab), and end screen feed (bpx-player-ending-wrap).
  const KEY_HIDE_HOME_FEED = "hideHomeFeed";
  const KEY_HIDE_SIDEBAR = "hideSidebar";
  const KEY_HIDE_END_SCREEN_FEED = "hideEndScreenFeed";
  const STYLE_ID_HIDE_FEED2 = "biliblocker-hide-feed2";
  const STYLE_ID_HIDE_SIDEBAR = "biliblocker-hide-sidebar";
  const STYLE_ID_HIDE_END_SCREEN_FEED = "biliblocker-hide-end-screen-feed";
  let enabledHomeFeed = true;
  let enabledSidebar = true;
  let enabledEndScreenFeed = true;

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

  function setSidebarHidden(hidden) {
    const existing = document.getElementById(STYLE_ID_HIDE_SIDEBAR);
    if (!hidden) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    const style = document.createElement("style");
    style.id = STYLE_ID_HIDE_SIDEBAR;
    style.textContent = `.rcmd-tab { display: none !important; }`;
    document.documentElement.appendChild(style);
  }

  function setEndScreenFeedHidden(hidden) {
    const existing = document.getElementById(STYLE_ID_HIDE_END_SCREEN_FEED);
    if (!hidden) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    const style = document.createElement("style");
    style.id = STYLE_ID_HIDE_END_SCREEN_FEED;
    style.textContent = `.bpx-player-ending-wrap { display: none !important; }`;
    document.documentElement.appendChild(style);
  }

  async function initSettings() {
    const storedHomeFeed = await storageGet(KEY_HIDE_HOME_FEED);
    const storedSidebar = await storageGet(KEY_HIDE_SIDEBAR);
    const storedEndScreenFeed = await storageGet(KEY_HIDE_END_SCREEN_FEED);
    
    const enabledHomeFeedValue =
      typeof storedHomeFeed?.[KEY_HIDE_HOME_FEED] === "boolean"
        ? storedHomeFeed[KEY_HIDE_HOME_FEED]
        : true;
    
    const enabledSidebarValue =
      typeof storedSidebar?.[KEY_HIDE_SIDEBAR] === "boolean"
        ? storedSidebar[KEY_HIDE_SIDEBAR]
        : true;

    const enabledEndScreenFeedValue =
      typeof storedEndScreenFeed?.[KEY_HIDE_END_SCREEN_FEED] === "boolean"
        ? storedEndScreenFeed[KEY_HIDE_END_SCREEN_FEED]
        : true;

    applyHomeFeedEnabled(!!enabledHomeFeedValue);
    applySidebarEnabled(!!enabledSidebarValue);
    applyEndScreenFeedEnabled(!!enabledEndScreenFeedValue);
  }

  function initMessageListener() {
    const api = getApi();
    if (!api?.runtime?.onMessage?.addListener) return;
    api.runtime.onMessage.addListener((msg) => {
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "SET_HIDE_HOME_FEED") {
        applyHomeFeedEnabled(!!msg.enabled);
      } else if (msg.type === "SET_HIDE_SIDEBAR") {
        applySidebarEnabled(!!msg.enabled);
      } else if (msg.type === "SET_HIDE_END_SCREEN_FEED") {
        applyEndScreenFeedEnabled(!!msg.enabled);
      }
    });
  }

  function applyHomeFeedEnabled(nextEnabled) {
    enabledHomeFeed = !!nextEnabled;
    setFeed2Hidden(enabledHomeFeed);
  }

  function applySidebarEnabled(nextEnabled) {
    enabledSidebar = !!nextEnabled;
    setSidebarHidden(enabledSidebar);
  }

  function applyEndScreenFeedEnabled(nextEnabled) {
    enabledEndScreenFeed = !!nextEnabled;
    setEndScreenFeedHidden(enabledEndScreenFeed);
  }

  function init() {
    initMessageListener();
    initSettings();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();



