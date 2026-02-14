(() => {
  // Toggle hiding home feed (feed2), sidebar (rcmd-tab), end screen feed (bpx-player-ending-wrap), and disable autoplay.
  const KEY_HIDE_HOME_FEED = "hideHomeFeed";
  const KEY_HIDE_SIDEBAR = "hideSidebar";
  const KEY_HIDE_END_SCREEN_FEED = "hideEndScreenFeed";
  const KEY_DISABLE_AUTOPLAY = "disableAutoplay";
  const KEY_HIDE_PLAYLIST = "hidePlaylist";
  const STYLE_ID_HIDE_FEED2 = "biliblocker-hide-feed2";
  const STYLE_ID_HIDE_SIDEBAR = "biliblocker-hide-sidebar";
  const STYLE_ID_HIDE_END_SCREEN_FEED = "biliblocker-hide-end-screen-feed";
  const STYLE_ID_HIDE_PLAYLIST = "biliblocker-hide-playlist";
  let enabledHomeFeed = true;
  let enabledSidebar = true;
  let enabledEndScreenFeed = true;
  let enabledDisableAutoplay = true;
  let enabledHidePlaylist = true;
  let autoplayObserver = null;

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
    style.textContent = `.right-container { display: none !important; }`;
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

  function setPlaylistHidden(hidden) {
    const existing = document.getElementById(STYLE_ID_HIDE_PLAYLIST);
    if (!hidden) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    const style = document.createElement("style");
    style.id = STYLE_ID_HIDE_PLAYLIST;
    style.textContent = `.video-pod { display: none !important; }`;
    document.documentElement.appendChild(style);
  }

  function toggleAutoplaySwitch(enabled) {
    // When enabled: find .switch-btn.on and remove "on" class
    // When disabled: find .switch-btn and add "on" class
    if (enabled) {
      const switches = document.querySelectorAll(".switch-btn.on");
      switches.forEach((el) => {
        el.classList.remove("on");
      });
    } else {
      const switches = document.querySelectorAll(".switch-btn:not(.on)");
      switches.forEach((el) => {
        el.classList.add("on");
      });
    }
  }

  function startObservingAutoplay() {
    if (autoplayObserver) return;
    autoplayObserver = new MutationObserver(() => {
      if (enabledDisableAutoplay) {
        toggleAutoplaySwitch(true);
      }
    });
    autoplayObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function stopObservingAutoplay() {
    if (!autoplayObserver) return;
    autoplayObserver.disconnect();
    autoplayObserver = null;
  }

  async function initSettings() {
    const storedHomeFeed = await storageGet(KEY_HIDE_HOME_FEED);
    const storedSidebar = await storageGet(KEY_HIDE_SIDEBAR);
    const storedEndScreenFeed = await storageGet(KEY_HIDE_END_SCREEN_FEED);
    const storedDisableAutoplay = await storageGet(KEY_DISABLE_AUTOPLAY);
    const storedHidePlaylist = await storageGet(KEY_HIDE_PLAYLIST);

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

    const enabledDisableAutoplayValue =
      typeof storedDisableAutoplay?.[KEY_DISABLE_AUTOPLAY] === "boolean"
        ? storedDisableAutoplay[KEY_DISABLE_AUTOPLAY]
        : true;

    const enabledHidePlaylistValue =
      typeof storedHidePlaylist?.[KEY_HIDE_PLAYLIST] === "boolean"
        ? storedHidePlaylist[KEY_HIDE_PLAYLIST]
        : true;

    applyHomeFeedEnabled(!!enabledHomeFeedValue);
    applySidebarEnabled(!!enabledSidebarValue);
    applyEndScreenFeedEnabled(!!enabledEndScreenFeedValue);
    applyDisableAutoplayEnabled(!!enabledDisableAutoplayValue);
    applyPlaylistEnabled(!!enabledHidePlaylistValue);
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
      } else if (msg.type === "SET_DISABLE_AUTOPLAY") {
        applyDisableAutoplayEnabled(!!msg.enabled);
      } else if (msg.type === "SET_HIDE_PLAYLIST") {
        applyPlaylistEnabled(!!msg.enabled);
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

  function applyDisableAutoplayEnabled(nextEnabled) {
    enabledDisableAutoplay = !!nextEnabled;
    if (enabledDisableAutoplay) {
      toggleAutoplaySwitch(true);
      startObservingAutoplay();
    } else {
      toggleAutoplaySwitch(false);
      stopObservingAutoplay();
    }
  }

  function applyPlaylistEnabled(nextEnabled) {
    enabledHidePlaylist = !!nextEnabled;
    setPlaylistHidden(enabledHidePlaylist);
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



