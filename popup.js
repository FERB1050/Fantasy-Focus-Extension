const toggle = document.getElementById("focusToggle");
const statusText = document.getElementById("statusText");
const blockedListEl = document.getElementById("blockedList");
const newSiteInput = document.getElementById("newSiteInput");
const addSiteBtn = document.getElementById("addSiteBtn");

const DEFAULT_BLOCKED = [
  "youtube.com",
  "www.youtube.com",
  "tiktok.com",
  "www.tiktok.com",
  "reddit.com",
  "www.reddit.com"
];

let blockedSites = [];

chrome.storage.sync.get(["focusMode", "blockedSites"], (data) => {
  const isOn = data.focusMode !== false;
  toggle.checked = isOn;
  statusText.textContent = isOn
    ? "The dragons guard your focus."
    : "The dragons are sleeping.";

  blockedSites = Array.isArray(data.blockedSites)
    ? data.blockedSites
    : DEFAULT_BLOCKED;

  renderBlockedList();
});

function renderBlockedList() {
  blockedListEl.innerHTML = "";
  blockedSites.forEach((site, index) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = site;

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.title = "Remove from blocklist";
    btn.addEventListener("click", () => {
      removeSite(index);
    });

    li.appendChild(span);
    li.appendChild(btn);
    blockedListEl.appendChild(li);
  });
}

toggle.addEventListener("change", () => {
  const isOn = toggle.checked;
  chrome.storage.sync.set({ focusMode: isOn });
  statusText.textContent = isOn
    ? "The dragons guard your focus."
    : "The dragons are sleeping.";
});

addSiteBtn.addEventListener("click", () => {
  const raw = newSiteInput.value.trim();
  if (!raw) return;

  let hostname = raw;
  if (hostname.startsWith("http://") || hostname.startsWith("https://")) {
    try {
      const u = new URL(hostname);
      hostname = u.hostname;
    } catch (e) {}
  }

  if (!blockedSites.includes(hostname)) {
    blockedSites.push(hostname);
    chrome.storage.sync.set({ blockedSites }, () => {
      renderBlockedList();
      newSiteInput.value = "";
    });
  } else {
    newSiteInput.value = "";
  }
});

function removeSite(index) {
  blockedSites.splice(index, 1);
  chrome.storage.sync.set({ blockedSites }, () => {
    renderBlockedList();
  });
}
