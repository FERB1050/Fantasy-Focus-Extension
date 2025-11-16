// focus.js

// Get the original URL from the query parameter (?orig=...)
const params = new URLSearchParams(window.location.search);
const originalUrl = params.get("orig");

const btn = document.getElementById("overrideBtn");

btn.addEventListener("click", () => {
  if (!originalUrl) {
    // Fallback if there is no original URL
    history.back();
    return;
  }

  let hostname = null;
  try {
    const u = new URL(originalUrl);
    hostname = u.hostname;
  } catch (e) {
    // If parsing fails, just try to go there anyway
    window.location.href = originalUrl;
    return;
  }

  // Set allowOnceHostname so the next load of this site is allowed
  chrome.storage.sync.set({ allowOnceHostname: hostname }, () => {
    // Now navigate to the original site
    window.location.href = originalUrl;
  });
});
