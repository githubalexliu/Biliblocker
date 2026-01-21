const KEY_HIDE_HOME_FEED = "hideHomeFeed";

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

async function sendSettingToTab(hideHomeFeed) {
  const api = getApi();
  const tab = await getActiveTab();
  if (!tab?.id || !api?.tabs?.sendMessage) return;
  try {
    const res = api.tabs.sendMessage(tab.id, { type: "SET_HIDE_HOME_FEED", enabled: hideHomeFeed });
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
  const checkbox = document.getElementById("hide-home-feed");
  if (!(checkbox instanceof HTMLInputElement)) return;

  const stored = await storageGet(KEY_HIDE_HOME_FEED);
  const initial = typeof stored?.[KEY_HIDE_HOME_FEED] === "boolean" ? stored[KEY_HIDE_HOME_FEED] : true;

  checkbox.checked = initial;
  // Persist default so content script can rely on it.
  if (typeof stored?.[KEY_HIDE_HOME_FEED] !== "boolean") {
    await storageSet({ [KEY_HIDE_HOME_FEED]: true });
  }

  // Apply immediately on current tab (no refresh needed).
  await sendSettingToTab(checkbox.checked);

  checkbox.addEventListener("change", async () => {
    await storageSet({ [KEY_HIDE_HOME_FEED]: checkbox.checked });
    await sendSettingToTab(checkbox.checked);
  });
});



