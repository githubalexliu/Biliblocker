const KEY_HIDE_HOME_FEED = "hideHomeFeed";
const KEY_HIDE_SIDEBAR = "hideSidebar";
const KEY_HIDE_END_SCREEN_FEED = "hideEndScreenFeed";

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

async function storageSet(obj) {
  const api = getApi();
  if (!api?.storage?.local?.set) return;
  const res = api.storage.local.set(obj);
  if (res && typeof res.then === "function") return await res;
  return await new Promise((resolve) => api.storage.local.set(obj, resolve));
}

async function getActiveTab() {
  const api = getApi();
  if (!api?.tabs?.query) return null;
  const res = api.tabs.query({ active: true, currentWindow: true });
  const tabs = res && typeof res.then === "function" ? await res : await new Promise((resolve) => api.tabs.query({ active: true, currentWindow: true }, resolve));
  return tabs?.[0] ?? null;
}

async function sendSettingToTab(type, enabled) {
  const api = getApi();
  const tab = await getActiveTab();
  if (!tab?.id || !api?.tabs?.sendMessage) return;
  try {
    const res = api.tabs.sendMessage(tab.id, { type, enabled });
    if (res && typeof res.then === "function") await res;
  } catch (_) {
    // Ignore: tab may not have our content script (non-bilibili pages).
  }
}

async function sendSettingToBackground(hideHomeFeed) {
  const api = getApi();
  if (!api?.runtime?.sendMessage) return;
  try {
    const res = api.runtime.sendMessage({ type: "SET_HIDE_HOME_FEED", enabled: hideHomeFeed });
    if (res && typeof res.then === "function") await res;
  } catch (_) {
    // no-op
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const checkboxHomeFeed = document.getElementById("hide-home-feed");
  const checkboxSidebar = document.getElementById("hide-sidebar");
  const checkboxEndScreenFeed = document.getElementById("hide-end-screen-feed");
  
  if (!(checkboxHomeFeed instanceof HTMLInputElement) || !(checkboxSidebar instanceof HTMLInputElement) || !(checkboxEndScreenFeed instanceof HTMLInputElement)) return;

  // Load and initialize home feed setting
  const storedHomeFeed = await storageGet(KEY_HIDE_HOME_FEED);
  const initialHomeFeed = typeof storedHomeFeed?.[KEY_HIDE_HOME_FEED] === "boolean" ? storedHomeFeed[KEY_HIDE_HOME_FEED] : true;
  checkboxHomeFeed.checked = initialHomeFeed;
  if (typeof storedHomeFeed?.[KEY_HIDE_HOME_FEED] !== "boolean") {
    await storageSet({ [KEY_HIDE_HOME_FEED]: true });
  }

  // Load and initialize sidebar setting
  const storedSidebar = await storageGet(KEY_HIDE_SIDEBAR);
  const initialSidebar = typeof storedSidebar?.[KEY_HIDE_SIDEBAR] === "boolean" ? storedSidebar[KEY_HIDE_SIDEBAR] : true;
  checkboxSidebar.checked = initialSidebar;
  if (typeof storedSidebar?.[KEY_HIDE_SIDEBAR] !== "boolean") {
    await storageSet({ [KEY_HIDE_SIDEBAR]: true });
  }

  // Load and initialize end screen feed setting
  const storedEndScreenFeed = await storageGet(KEY_HIDE_END_SCREEN_FEED);
  const initialEndScreenFeed = typeof storedEndScreenFeed?.[KEY_HIDE_END_SCREEN_FEED] === "boolean" ? storedEndScreenFeed[KEY_HIDE_END_SCREEN_FEED] : true;
  checkboxEndScreenFeed.checked = initialEndScreenFeed;
  if (typeof storedEndScreenFeed?.[KEY_HIDE_END_SCREEN_FEED] !== "boolean") {
    await storageSet({ [KEY_HIDE_END_SCREEN_FEED]: true });
  }

  // Apply immediately on current tab (no refresh needed).
  await sendSettingToTab("SET_HIDE_HOME_FEED", checkboxHomeFeed.checked);
  await sendSettingToTab("SET_HIDE_SIDEBAR", checkboxSidebar.checked);
  await sendSettingToTab("SET_HIDE_END_SCREEN_FEED", checkboxEndScreenFeed.checked);

  checkboxHomeFeed.addEventListener("change", async () => {
    await storageSet({ [KEY_HIDE_HOME_FEED]: checkboxHomeFeed.checked });
    await sendSettingToTab("SET_HIDE_HOME_FEED", checkboxHomeFeed.checked);
  });

  checkboxSidebar.addEventListener("change", async () => {
    await storageSet({ [KEY_HIDE_SIDEBAR]: checkboxSidebar.checked });
    await sendSettingToTab("SET_HIDE_SIDEBAR", checkboxSidebar.checked);
  });

  checkboxEndScreenFeed.addEventListener("change", async () => {
    await storageSet({ [KEY_HIDE_END_SCREEN_FEED]: checkboxEndScreenFeed.checked });
    await sendSettingToTab("SET_HIDE_END_SCREEN_FEED", checkboxEndScreenFeed.checked);
  });
});



