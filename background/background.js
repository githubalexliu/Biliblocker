function getApi() {
  return globalThis.browser ?? globalThis.chrome;
}

const api = getApi();

api?.runtime?.onInstalled?.addListener?.(() => {
  console.log("Biliblocker installed");
});



