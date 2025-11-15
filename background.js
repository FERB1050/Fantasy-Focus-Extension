const DEFAULT_BLOCKED = [
  "youtube.com",
  "www.youtube.com",
  "tiktok.com",
  "www.tiktok.com",
  "reddit.com",
  "www.reddit.com"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    focusMode: true,
    blockedSites: DEFAULT_BLOCKED
  });
});

function isBlocked(hostname, blockedList) {
  return blockedList.includes(hostname);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const url = new URL(tab.url);

  chrome.storage.sync.get(["focusMode", "blockedSites"], (data) => {
    const focusMode = data.focusMode !== false;
    const blockedSites = Array.isArray(data.blockedSites)
      ? data.blockedSites
      : DEFAULT_BLOCKED;

    if (!focusMode) return;

    if (isBlocked(url.hostname, blockedSites)) {
      const focusPageUrl = chrome.runtime.getURL("focus.html");
      chrome.tabs.update(tabId, { url: focusPageUrl });
    }
  });
});
