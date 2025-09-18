// Background service worker (MV3)
browser.runtime.onInstalled.addListener(() => {
  console.log("Biliblocker installed");
});

// Example: handle action icon click to open popup (default handled by manifest)
browser.action.onClicked.addListener(async (tab) => {
  // no-op; popup opens by default. Keep for demonstration/logging.
  console.debug("Action clicked", tab?.id);
});



