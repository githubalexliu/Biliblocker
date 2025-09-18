async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function sendToggle(enabled) {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  try {
    await browser.tabs.sendMessage(tab.id, { type: "TOGGLE_OUTLINE", enabled });
  } catch (e) {
    // If content script not injected yet, try injecting via MV3 scripting
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content/content.js"],
      });
      await browser.tabs.sendMessage(tab.id, { type: "TOGGLE_OUTLINE", enabled });
    } catch (_) {
      // no-op
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle");
  if (!toggle) return;
  toggle.addEventListener("change", () => {
    sendToggle(toggle.checked);
  });
});



