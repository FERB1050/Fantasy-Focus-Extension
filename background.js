const DEFAULT_BLOCKED = [
  "youtube.com",
  "www.youtube.com",
  "tiktok.com",
  "www.tiktok.com",
  "reddit.com",
  "www.reddit.com"
];

// Set defaults when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    focusMode: true,
    blockedSites: DEFAULT_BLOCKED,
    allowOnceHostname: null // no override at start
  });
});

function isBlocked(hostname, blockedList) {
  return blockedList.includes(hostname);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const url = new URL(tab.url);

  chrome.storage.sync.get(
    ["focusMode", "blockedSites", "allowOnceHostname"],
    (data) => {
      const focusMode = data.focusMode !== false; // default true
      const blockedSites = Array.isArray(data.blockedSites)
        ? data.blockedSites
        : DEFAULT_BLOCKED;
      const allowOnceHostname = data.allowOnceHostname || null;

      // If focus mode is off, do nothing
      if (!focusMode) return;

      // If this hostname is allowed one time, skip blocking and clear override
      if (allowOnceHostname && url.hostname === allowOnceHostname) {
        chrome.storage.sync.set({ allowOnceHostname: null });
        return;
      }

      // Normal blocking logic
      if (isBlocked(url.hostname, blockedSites)) {
        // Save the original URL by passing it as a query param to focus.html
        const originalUrl = tab.url;
        const focusPageUrl =
          chrome.runtime.getURL("focus.html") +
          `?orig=${encodeURIComponent(originalUrl)}`;

        chrome.tabs.update(tabId, { url: focusPageUrl });
      }
    }
  );
});
