const STORAGE_KEY = "shortcuthub_data_v6";
const FIRST_STORY_KEY = "shortcuthub_story_seen_v1";
const FIRST_WELCOME_KEY = "shortcuthub_first_welcome_seen_v1";
const DEFAULT_CREATOR_PHOTO = "https://github.com/AshishCherian15.png";
const DEFAULT_BACKGROUND = {
  type: "video",
  src: "/space-drive.webm",
  sourceKind: "url"
};

const DEFAULT_SHORTCUTS = [
  { name: "YouTube", url: "https://www.youtube.com", group: "Daily", icon: "" },
  { name: "Gmail", url: "https://mail.google.com", group: "Daily", icon: "" },
  { name: "Claude", url: "https://claude.ai", group: "AI", icon: "" },
  { name: "ChatGPT", url: "https://chatgpt.com", group: "AI", icon: "" },
  { name: "Gemini", url: "https://gemini.google.com", group: "AI", icon: "" },
  { name: "Instagram", url: "https://www.instagram.com", group: "Social", icon: "" },
  { name: "WhatsApp", url: "https://web.whatsapp.com", group: "Social", icon: "" },
  { name: "LinkedIn", url: "https://www.linkedin.com", group: "Career", icon: "" },
  { name: "Discord", url: "https://discord.com/app", group: "Social", icon: "" }
];

const DEFAULT_SETTINGS = {
  editMode: true,
  openInNewTab: true,
  confirmDelete: true,
  groupSort: "az",
  tileSize: "comfortable",
  cardStyle: "glass",
  searchEngine: "google",
  customSearchUrl: "",
  accent: "#3de0d0",
  showClock: true,
  showAbout: true,
  showFooter: true,
  bgAudio: true,
  bgMuted: false,
  audioVolume: 50,
  creatorName: "User"
};

const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=%s",
  bing: "https://www.bing.com/search?q=%s",
  duckduckgo: "https://duckduckgo.com/?q=%s",
  brave: "https://search.brave.com/search?q=%s"
};

const state = {
  shortcuts: [],
  editIndex: null,
  theme: "light",
  background: { ...DEFAULT_BACKGROUND },
  settings: { ...DEFAULT_SETTINGS }
};

const refs = {
  container: document.getElementById("container"),
  search: document.getElementById("search"),
  clock: document.getElementById("clock"),
  date: document.getElementById("date"),
  clockWrap: document.querySelector(".clock-wrap"),
  about: document.getElementById("about"),
  footer: document.querySelector(".site-footer"),
  audioToggle: document.getElementById("audioToggle"),

  brandBtn: document.getElementById("brandBtn"),
  addBtn: document.getElementById("addBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  bgBtn: document.getElementById("bgBtn"),

  welcomeLine: document.getElementById("welcomeLine"),
  heroName: document.getElementById("heroName"),
  clockUserName: document.getElementById("clockUserName"),

  shortcutDialog: document.getElementById("shortcutDialog"),
  shortcutForm: document.getElementById("shortcutForm"),
  dialogTitle: document.getElementById("dialogTitle"),
  cancelDialog: document.getElementById("cancelDialog"),
  name: document.getElementById("name"),
  url: document.getElementById("url"),
  group: document.getElementById("group"),
  icon: document.getElementById("icon"),

  backgroundDialog: document.getElementById("backgroundDialog"),
  backgroundForm: document.getElementById("backgroundForm"),
  cancelBackground: document.getElementById("cancelBackground"),
  clearBackground: document.getElementById("clearBackground"),
  bgType: document.getElementById("bgType"),
  bgSource: document.getElementById("bgSource"),
  bgUpload: document.getElementById("bgUpload"),

  settingsDialog: document.getElementById("settingsDialog"),
  settingsForm: document.getElementById("settingsForm"),
  cancelSettings: document.getElementById("cancelSettings"),
  resetDefaultsBtn: document.getElementById("resetDefaultsBtn"),
  tabButtons: Array.from(document.querySelectorAll(".tab-btn")),
  tabPanes: Array.from(document.querySelectorAll(".settings-pane")),

  setEditMode: document.getElementById("setEditMode"),
  setOpenMode: document.getElementById("setOpenMode"),
  setConfirmDelete: document.getElementById("setConfirmDelete"),
  setGroupSort: document.getElementById("setGroupSort"),
  setTileSize: document.getElementById("setTileSize"),
  setCardStyle: document.getElementById("setCardStyle"),
  setSearchEngine: document.getElementById("setSearchEngine"),
  setCustomSearchUrl: document.getElementById("setCustomSearchUrl"),
  setAccent: document.getElementById("setAccent"),
  setShowClock: document.getElementById("setShowClock"),
  setShowAbout: document.getElementById("setShowAbout"),
  setShowFooter: document.getElementById("setShowFooter"),
  setBgAudio: document.getElementById("setBgAudio"),
  setBgMuted: document.getElementById("setBgMuted"),
  setAudioVolume: document.getElementById("setAudioVolume"),
  setCreatorName: document.getElementById("setCreatorName"),
  editNameBtn: document.getElementById("editNameBtn"),

  storyDialog: document.getElementById("storyDialog"),
  closeStoryBtn: document.getElementById("closeStoryBtn"),
  storyPhoto: document.getElementById("storyPhoto"),

  firstTimeDialog: document.getElementById("firstTimeDialog"),
  firstTimeForm: document.getElementById("firstTimeForm"),
  firstTimeGreeting: document.getElementById("firstTimeGreeting"),
  firstTimeNameInput: document.getElementById("firstTimeNameInput"),
  closeFirstTimeBtn: document.getElementById("closeFirstTimeBtn"),

  bgImage: document.getElementById("bgImage"),
  bgVideo: document.getElementById("bgVideo"),
  bgYoutube: document.getElementById("bgYoutube")
};

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function normalizeBackgroundSource(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  // Keep already-valid absolute, root-relative, and browser-managed sources.
  if (/^(https?:|data:|blob:)/i.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return trimmed;
  }

  // Treat local media file names as deploy-root assets.
  if (/\.(mp4|webm|ogg|png|jpe?g|gif|webp|svg)(\?|$)/i.test(trimmed)) {
    return `/${trimmed.replace(/^\/+/, "")}`;
  }

  return normalizeUrl(trimmed);
}

function isValidUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return false;
  }

  if (/^(data:|blob:)/i.test(raw) || raw.startsWith("/") || raw.startsWith("./") || raw.startsWith("../")) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function safeText(value) {
  return String(value || "").replace(/[<>]/g, "");
}

function getFavicon(url) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=64`;
}

function getYoutubeId(url) {
  const idPattern = /^[a-zA-Z0-9_-]{11}$/;
  const direct = String(url || "").trim();
  if (idPattern.test(direct)) {
    return direct;
  }

  try {
    const source = new URL(url);
    const host = source.hostname.replace(/^www\./i, "").replace(/^m\./i, "");

    if (host === "youtu.be") {
      const shortId = source.pathname.split("/").filter(Boolean)[0] || "";
      return idPattern.test(shortId) ? shortId : "";
    }

    const watchId = source.searchParams.get("v") || "";
    if (idPattern.test(watchId)) {
      return watchId;
    }

    const pathParts = source.pathname.split("/").filter(Boolean);
    const markerIndex = pathParts.findIndex((part) => ["embed", "shorts", "live", "v"].includes(part));
    if (markerIndex >= 0) {
      const embeddedId = pathParts[markerIndex + 1] || "";
      if (idPattern.test(embeddedId)) {
        return embeddedId;
      }
    }

    const possiblePathId = pathParts[pathParts.length - 1] || "";
    if (idPattern.test(possiblePathId)) {
      return possiblePathId;
    }
  } catch {
    const match = direct.match(/([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : "";
  }

  const fallbackMatch = direct.match(/([a-zA-Z0-9_-]{11})/);
  return fallbackMatch ? fallbackMatch[1] : "";
}

function detectBackgroundType(src) {
  const value = String(src || "").toLowerCase();
  if (value.includes("youtube.com") || value.includes("youtu.be") || value.includes("youtube-nocookie.com")) {
    return "youtube";
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(value)) {
    return "video";
  }
  return "image";
}

function openDialog(dialog) {
  if (!dialog) {
    return;
  }
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }
  dialog.setAttribute("open", "open");
}

function closeDialog(dialog) {
  if (!dialog) {
    return;
  }
  if (typeof dialog.close === "function") {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
}

function serializableBackground() {
  if (state.background.sourceKind === "upload") {
    return { type: "image", src: "", sourceKind: "url" };
  }
  return state.background;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    shortcuts: state.shortcuts,
    theme: state.theme,
    background: serializableBackground(),
    settings: state.settings
  }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.shortcuts = [...DEFAULT_SHORTCUTS];
    state.theme = "light";
    state.background = { ...DEFAULT_BACKGROUND };
    state.settings = { ...DEFAULT_SETTINGS };
    saveState();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.shortcuts = Array.isArray(parsed.shortcuts) ? parsed.shortcuts : [...DEFAULT_SHORTCUTS];
    state.theme = "light";
    if (parsed.background && typeof parsed.background === "object") {
      const parsedSrc = normalizeBackgroundSource(parsed.background.src || "");
      if (!parsedSrc) {
        state.background = { ...DEFAULT_BACKGROUND };
      } else {
        state.background = {
          type: parsed.background.type || detectBackgroundType(parsedSrc),
          src: parsedSrc,
          sourceKind: parsed.background.sourceKind || "url"
        };
      }
    } else {
      state.background = { ...DEFAULT_BACKGROUND };
    }
    state.settings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {})
    };
  } catch {
    state.shortcuts = [...DEFAULT_SHORTCUTS];
    state.theme = "light";
    state.background = { ...DEFAULT_BACKGROUND };
    state.settings = { ...DEFAULT_SETTINGS };
    saveState();
  }
}

function applyTheme() {
  document.body.classList.add("light");
}

function sendYoutubeCommand(func, args = []) {
  if (!refs.bgYoutube.contentWindow) {
    return;
  }
  refs.bgYoutube.contentWindow.postMessage(JSON.stringify({
    event: "command",
    func,
    args
  }), "*");
}

function syncYoutubeAudio() {
  if (state.background.type !== "youtube") {
    return;
  }

  const volume = Math.max(0, Math.min(100, Number(state.settings.audioVolume || 0)));
  sendYoutubeCommand("setVolume", [volume]);

  if (!state.settings.bgAudio || state.settings.bgMuted) {
    sendYoutubeCommand("mute", []);
  } else {
    sendYoutubeCommand("unMute", []);
  }
}

function applyMediaAudioPreferences() {
  const volume = Math.max(0, Math.min(1, Number(state.settings.audioVolume || 0) / 100));
  const allowAudio = !!state.settings.bgAudio;
  const muted = !allowAudio || !!state.settings.bgMuted;

  refs.bgVideo.volume = volume;
  refs.bgVideo.muted = muted;

  refs.audioToggle.classList.toggle("hidden", !allowAudio);
  refs.audioToggle.textContent = muted ? "Unmute" : "Mute";

  syncYoutubeAudio();
}

function buildYoutubeEmbedUrl(src) {
  const id = getYoutubeId(src);
  if (!id) {
    return "";
  }
  const mute = !state.settings.bgAudio || state.settings.bgMuted ? "1" : "0";
  const origin = window.location.origin && window.location.origin !== "null"
    ? `&origin=${encodeURIComponent(window.location.origin)}`
    : "";
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${mute}&controls=0&loop=1&playlist=${id}&playsinline=1&enablejsapi=1&rel=0&modestbranding=1${origin}`;
}

function applyBackground() {
  const { bgImage, bgVideo, bgYoutube } = refs;
  bgImage.style.display = "none";
  bgVideo.style.display = "none";
  bgYoutube.style.display = "none";

  if (!state.background.src) {
    bgYoutube.src = "";
    bgVideo.src = "";
    bgImage.src = "";
    return;
  }

  if (state.background.type === "youtube") {
    const embedUrl = buildYoutubeEmbedUrl(state.background.src);
    if (!embedUrl) {
      return;
    }
    bgYoutube.src = embedUrl;
    bgYoutube.style.display = "block";
    window.setTimeout(syncYoutubeAudio, 900);
    return;
  }

  if (state.background.type === "video") {
    bgVideo.src = state.background.src;
    bgVideo.style.display = "block";
    applyMediaAudioPreferences();
    const playPromise = bgVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        refs.audioToggle.textContent = "Tap for Audio";
      });
    }
    return;
  }

  bgImage.src = state.background.src;
  bgImage.style.display = "block";
}

function applyCreatorProfile() {
  const name = safeText(state.settings.creatorName || "").trim() || "User";
  refs.heroName.textContent = name;
  refs.welcomeLine.textContent = `Welcome, ${name}.`;
  refs.clockUserName.textContent = name;
  refs.storyPhoto.src = DEFAULT_CREATOR_PHOTO;
}

function editNameQuickly() {
  const current = state.settings.creatorName || "";
  const nextValue = prompt("Enter your name", current);
  if (nextValue === null) {
    return;
  }
  const clean = safeText(nextValue).trim();
  if (!clean) {
    alert("Name cannot be empty.");
    return;
  }
  state.settings.creatorName = clean;
  refs.setCreatorName.value = clean;
  applyCreatorProfile();
  saveState();
}

function applySettingsToUI() {
  document.body.classList.toggle("edit-off", !state.settings.editMode);
  document.body.classList.toggle("tile-compact", state.settings.tileSize === "compact");
  document.body.classList.toggle("tile-large", state.settings.tileSize === "large");
  document.body.classList.toggle("card-solid", state.settings.cardStyle === "solid");

  refs.clockWrap.style.display = state.settings.showClock ? "block" : "none";
  refs.about.style.display = state.settings.showAbout ? "block" : "none";
  refs.footer.style.display = state.settings.showFooter ? "block" : "none";

  document.documentElement.style.setProperty("--accent", state.settings.accent || DEFAULT_SETTINGS.accent);
  document.documentElement.style.setProperty("--dynamic-text", state.settings.accent || DEFAULT_SETTINGS.accent);
  document.documentElement.style.setProperty("--overlay-alpha", "0.08");
  document.documentElement.style.setProperty("--glass", "rgba(255, 255, 255, 0.08)");
  document.documentElement.style.setProperty("--tile-alpha", "0.04");
  document.documentElement.style.setProperty("--tile-alpha-light", "0.12");

  applyMediaAudioPreferences();
  applyCreatorProfile();
}

function getSearchUrl(query) {
  const key = state.settings.searchEngine;
  let template = SEARCH_ENGINES[key] || SEARCH_ENGINES.google;
  if (key === "custom") {
    const custom = state.settings.customSearchUrl || "";
    if (custom.includes("%s")) {
      template = custom;
    }
  }
  return template.replace("%s", encodeURIComponent(query));
}

function groupedShortcuts(filtered) {
  const grouped = {};
  filtered.forEach((item) => {
    const key = safeText(item.group || "General") || "General";
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  return grouped;
}

function reorderByIndexes(from, to) {
  if (!state.settings.editMode) {
    return;
  }
  if (from === to || from < 0 || to < 0 || from >= state.shortcuts.length || to >= state.shortcuts.length) {
    return;
  }
  const moved = state.shortcuts.splice(from, 1)[0];
  state.shortcuts.splice(to, 0, moved);
  saveState();
  render();
}

function openShortcut(url) {
  const normalized = normalizeUrl(url);
  if (!isValidUrl(normalized)) {
    alert("This shortcut URL is invalid.");
    return;
  }

  if (state.settings.openInNewTab) {
    window.open(normalized, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = normalized;
  }
}

function render() {
  const term = refs.search.value.trim().toLowerCase();
  const filtered = state.shortcuts.filter((item) => {
    const name = (item.name || "").toLowerCase();
    const url = (item.url || "").toLowerCase();
    const group = (item.group || "").toLowerCase();
    return name.includes(term) || url.includes(term) || group.includes(term);
  });

  refs.container.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.innerHTML = "No shortcuts match your search.<br>Press Enter to search the web with your selected engine.";
    refs.container.appendChild(empty);
    return;
  }

  const grouped = groupedShortcuts(filtered);
  const groupNames = Object.keys(grouped);

  if (state.settings.groupSort === "az") {
    groupNames.sort((a, b) => a.localeCompare(b));
  }

  groupNames.forEach((groupName) => {
    const group = document.createElement("section");
    group.className = "group";

    const header = document.createElement("div");
    header.className = "group-header";
    header.innerHTML = `
      <h3 class="group-title">${safeText(groupName)}</h3>
      <span class="group-count">${grouped[groupName].length} links</span>
    `;

    const grid = document.createElement("div");
    grid.className = "grid";

    grouped[groupName].forEach((shortcut) => {
      const index = state.shortcuts.indexOf(shortcut);
      const card = document.createElement("article");
      card.className = "tile";
      card.draggable = !!state.settings.editMode;

      const iconSource = shortcut.icon && isValidUrl(normalizeUrl(shortcut.icon))
        ? normalizeUrl(shortcut.icon)
        : getFavicon(shortcut.url);

      card.innerHTML = `
        <div class="actions">
          <button class="icon-btn edit" title="Edit">Edit</button>
          <button class="icon-btn delete" title="Delete">Del</button>
        </div>
        <img class="tile-icon" src="${iconSource}" alt="${safeText(shortcut.name)} icon" loading="lazy">
        <span class="tile-name">${safeText(shortcut.name)}</span>
      `;

      const editBtn = card.querySelector(".edit");
      const deleteBtn = card.querySelector(".delete");

      editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openShortcutDialog(index);
      });

      deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteShortcut(index);
      });

      card.addEventListener("click", () => openShortcut(shortcut.url));

      card.addEventListener("dragstart", (event) => {
        if (!state.settings.editMode) {
          return;
        }
        event.dataTransfer.setData("text/plain", String(index));
      });

      card.addEventListener("dragover", (event) => {
        if (!state.settings.editMode) {
          return;
        }
        event.preventDefault();
      });

      card.addEventListener("drop", (event) => {
        if (!state.settings.editMode) {
          return;
        }
        event.preventDefault();
        const from = Number(event.dataTransfer.getData("text/plain"));
        reorderByIndexes(from, index);
      });

      grid.appendChild(card);
    });

    group.appendChild(header);
    group.appendChild(grid);
    refs.container.appendChild(group);
  });
}

function resetShortcutForm() {
  refs.shortcutForm.reset();
  state.editIndex = null;
  refs.dialogTitle.textContent = "Add Shortcut";
}

function openShortcutDialog(index = null) {
  resetShortcutForm();
  if (index !== null) {
    state.editIndex = index;
    const item = state.shortcuts[index];
    refs.name.value = item.name || "";
    refs.url.value = item.url || "";
    refs.group.value = item.group || "";
    refs.icon.value = item.icon || "";
    refs.dialogTitle.textContent = "Edit Shortcut";
  }
  openDialog(refs.shortcutDialog);
}

function closeShortcutDialog() {
  closeDialog(refs.shortcutDialog);
  resetShortcutForm();
}

function submitShortcut(event) {
  event.preventDefault();

  const payload = {
    name: safeText(refs.name.value).trim(),
    url: normalizeUrl(refs.url.value),
    group: safeText(refs.group.value).trim() || "General",
    icon: normalizeUrl(refs.icon.value.trim())
  };

  if (!payload.name) {
    alert("Please enter a shortcut name.");
    return;
  }

  if (!isValidUrl(payload.url)) {
    alert("Please enter a valid URL.");
    return;
  }

  if (payload.icon && !isValidUrl(payload.icon)) {
    alert("Custom icon URL is not valid.");
    return;
  }

  if (state.editIndex !== null) {
    state.shortcuts[state.editIndex] = payload;
  } else {
    state.shortcuts.push(payload);
  }

  saveState();
  render();
  closeShortcutDialog();
}

function deleteShortcut(index) {
  const item = state.shortcuts[index];
  if (!item) {
    return;
  }

  if (state.settings.confirmDelete) {
    const accepted = confirm(`Delete shortcut \"${item.name}\"?`);
    if (!accepted) {
      return;
    }
  }

  state.shortcuts.splice(index, 1);
  saveState();
  render();
}

function openBackgroundDialog() {
  const backgroundType = state.background.type || "auto";
  refs.bgType.value = ["auto", "image", "video"].includes(backgroundType) ? backgroundType : "auto";
  refs.bgSource.value = state.background.sourceKind === "url" ? state.background.src : "";
  refs.bgUpload.value = "";
  openDialog(refs.backgroundDialog);
}

function closeBackgroundDialog() {
  closeDialog(refs.backgroundDialog);
}

function clearBackground() {
  state.background = { ...DEFAULT_BACKGROUND };
  refs.bgYoutube.src = "";
  refs.bgVideo.src = "";
  refs.bgImage.src = "";
  applyBackground();
  saveState();
  closeBackgroundDialog();
}

function submitBackground(event) {
  event.preventDefault();
  const typeChoice = refs.bgType.value || "auto";
  const upload = refs.bgUpload.files && refs.bgUpload.files[0];

  if (upload) {
    const uploadType = upload.type.startsWith("video/") ? "video" : "image";
    state.background = {
      type: uploadType,
      src: URL.createObjectURL(upload),
      sourceKind: "upload"
    };
    applyBackground();
    closeBackgroundDialog();
    return;
  }

  const src = normalizeBackgroundSource(refs.bgSource.value.trim());
  if (src && !isValidUrl(src)) {
    alert("Please use a valid background URL.");
    return;
  }

  if (!src) {
    state.background = { ...DEFAULT_BACKGROUND };
    applyBackground();
    saveState();
    closeBackgroundDialog();
    return;
  }

  const resolvedType = typeChoice === "auto" ? detectBackgroundType(src) : typeChoice;

  if (resolvedType === "youtube" && src && !getYoutubeId(src)) {
    alert("Could not detect a valid YouTube video ID from this URL.");
    return;
  }

  state.background = {
    type: resolvedType,
    src,
    sourceKind: "url"
  };

  applyBackground();
  saveState();
  closeBackgroundDialog();
}

function syncSettingsForm() {
  refs.setEditMode.value = state.settings.editMode ? "on" : "off";
  refs.setOpenMode.value = state.settings.openInNewTab ? "new" : "same";
  refs.setConfirmDelete.value = state.settings.confirmDelete ? "on" : "off";
  refs.setGroupSort.value = state.settings.groupSort;
  refs.setTileSize.value = state.settings.tileSize;
  refs.setCardStyle.value = state.settings.cardStyle;
  refs.setSearchEngine.value = state.settings.searchEngine;
  refs.setCustomSearchUrl.value = state.settings.customSearchUrl;
  refs.setAccent.value = state.settings.accent;
  refs.setShowClock.value = state.settings.showClock ? "on" : "off";
  refs.setShowAbout.value = state.settings.showAbout ? "on" : "off";
  refs.setShowFooter.value = state.settings.showFooter ? "on" : "off";
  refs.setBgAudio.value = state.settings.bgAudio ? "on" : "off";
  refs.setBgMuted.value = state.settings.bgMuted ? "on" : "off";
  refs.setAudioVolume.value = String(state.settings.audioVolume);
  refs.setCreatorName.value = state.settings.creatorName;
}

function activateSettingsTab(tab) {
  refs.tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  refs.tabPanes.forEach((pane) => {
    pane.classList.toggle("active", pane.dataset.pane === tab);
  });
}

function openSettingsDialog() {
  syncSettingsForm();
  activateSettingsTab("appearance");
  openDialog(refs.settingsDialog);
}

function closeSettingsDialog() {
  closeDialog(refs.settingsDialog);
}

function submitSettings(event) {
  event.preventDefault();
  const customUrl = refs.setCustomSearchUrl.value.trim();

  if (refs.setSearchEngine.value === "custom" && customUrl && !customUrl.includes("%s")) {
    alert("Custom search URL must include %s placeholder.");
    return;
  }

  state.settings = {
    editMode: refs.setEditMode.value === "on",
    openInNewTab: refs.setOpenMode.value === "new",
    confirmDelete: refs.setConfirmDelete.value === "on",
    groupSort: refs.setGroupSort.value,
    tileSize: refs.setTileSize.value,
    cardStyle: refs.setCardStyle.value,
    searchEngine: refs.setSearchEngine.value,
    customSearchUrl: customUrl,
    accent: refs.setAccent.value,
    showClock: refs.setShowClock.value === "on",
    showAbout: refs.setShowAbout.value === "on",
    showFooter: refs.setShowFooter.value === "on",
    bgAudio: refs.setBgAudio.value === "on",
    bgMuted: refs.setBgMuted.value === "on",
    audioVolume: Number(refs.setAudioVolume.value),
    creatorName: safeText(refs.setCreatorName.value.trim()) || "User"
  };

  applySettingsToUI();
  applyBackground();
  saveState();
  render();
  closeSettingsDialog();
}

function resetDefaults() {
  const confirmed = confirm("Reset all settings to defaults? This will keep your shortcuts.");
  if (!confirmed) {
    return;
  }

  state.settings = { ...DEFAULT_SETTINGS };
  state.theme = "light";
  state.background = { ...DEFAULT_BACKGROUND };
  refs.bgYoutube.src = "";
  refs.bgVideo.src = "";
  refs.bgImage.src = "";

  applyTheme();
  applyBackground();
  applySettingsToUI();
  saveState();
  render();
  syncSettingsForm();
}

function updateClock() {
  const now = new Date();
  refs.clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  refs.date.textContent = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function maybeSearchWeb(event) {
  if (event.key !== "Enter") {
    return;
  }

  const query = refs.search.value.trim();
  if (!query) {
    return;
  }

  const hasMatch = state.shortcuts.some((item) => {
    const value = `${item.name} ${item.url} ${item.group}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });

  if (hasMatch) {
    return;
  }

  const url = getSearchUrl(query);
  if (state.settings.openInNewTab) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = url;
  }
}

function toggleAudioState() {
  if (!state.settings.bgAudio) {
    state.settings.bgAudio = true;
    state.settings.bgMuted = false;
  } else {
    state.settings.bgMuted = !state.settings.bgMuted;
  }
  applyMediaAudioPreferences();
  syncYoutubeAudio();
  saveState();
}

function maybeShowStory() {
  const seen = localStorage.getItem(FIRST_STORY_KEY) === "1";
  if (seen) {
    return;
  }
  openDialog(refs.storyDialog);
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

function maybeShowFirstTimeMessage() {
  const seen = localStorage.getItem(FIRST_WELCOME_KEY) === "1";
  if (seen) {
    return false;
  }
  refs.firstTimeGreeting.textContent = getTimeGreeting();
  refs.firstTimeNameInput.value = "";
  openDialog(refs.firstTimeDialog);
  return true;
}

function closeFirstTimeMessage(event) {
  if (event) {
    event.preventDefault();
  }

  const providedName = safeText(refs.firstTimeNameInput.value).trim();
  if (!providedName) {
    alert("Please enter your name to continue.");
    refs.firstTimeNameInput.focus();
    return;
  }

  state.settings.creatorName = providedName;
  applyCreatorProfile();
  saveState();
  localStorage.setItem(FIRST_WELCOME_KEY, "1");
  closeDialog(refs.firstTimeDialog);
  maybeShowStory();
}

function closeStory() {
  localStorage.setItem(FIRST_STORY_KEY, "1");
  closeDialog(refs.storyDialog);
}

function keyboardShortcuts(event) {
  const targetTag = (event.target.tagName || "").toLowerCase();
  const typing = targetTag === "input" || targetTag === "textarea" || targetTag === "select";

  if (!typing && event.key.toLowerCase() === "n") {
    event.preventDefault();
    openShortcutDialog();
  }

  if (!typing && event.key.toLowerCase() === "s") {
    event.preventDefault();
    refs.search.focus();
  }

  if (event.key === "Escape") {
    closeDialog(refs.shortcutDialog);
    closeDialog(refs.backgroundDialog);
    closeDialog(refs.settingsDialog);
    closeDialog(refs.storyDialog);
    closeDialog(refs.firstTimeDialog);
  }
}

function initEvents() {
  refs.search.addEventListener("input", render);
  refs.search.addEventListener("keydown", maybeSearchWeb);

  refs.brandBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  refs.addBtn.addEventListener("click", () => openShortcutDialog());
  refs.settingsBtn.addEventListener("click", openSettingsDialog);
  refs.bgBtn.addEventListener("click", openBackgroundDialog);

  refs.shortcutForm.addEventListener("submit", submitShortcut);
  refs.cancelDialog.addEventListener("click", closeShortcutDialog);

  refs.backgroundForm.addEventListener("submit", submitBackground);
  refs.cancelBackground.addEventListener("click", closeBackgroundDialog);
  refs.clearBackground.addEventListener("click", clearBackground);

  refs.settingsForm.addEventListener("submit", submitSettings);
  refs.cancelSettings.addEventListener("click", closeSettingsDialog);
  refs.resetDefaultsBtn.addEventListener("click", resetDefaults);

  refs.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activateSettingsTab(btn.dataset.tab);
    });
  });

  refs.editNameBtn.addEventListener("click", editNameQuickly);

  refs.audioToggle.addEventListener("click", toggleAudioState);
  refs.closeStoryBtn.addEventListener("click", closeStory);
  refs.firstTimeForm.addEventListener("submit", closeFirstTimeMessage);

  refs.bgYoutube.addEventListener("load", () => {
    window.setTimeout(syncYoutubeAudio, 700);
  });

  document.addEventListener("keydown", keyboardShortcuts);
}

function init() {
  loadState();
  applyTheme();
  applyBackground();
  applySettingsToUI();
  updateClock();
  setInterval(updateClock, 1000);
  initEvents();
  render();
  const welcomeShown = maybeShowFirstTimeMessage();
  if (!welcomeShown) {
    maybeShowStory();
  }
}

init();
