// Background service worker (MV3)
browser.runtime.onInstalled.addListener(() => {
  console.log("Biliblocker installed");
});

// Block all image requests on bilibili.com
browser.webRequest.onBeforeRequest.addListener(
  () => ({ cancel: true }),
  { urls: ["*://*.bilibili.com/*"], types: ["image"] },
  ["blocking"]
);



