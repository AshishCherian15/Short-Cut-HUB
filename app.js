const STORAGE_KEY = "shortcuthub_data_v5";
const FIRST_STORY_KEY = "shortcuthub_story_seen_v1";
const DEFAULT_CREATOR_PHOTO = "https://github.com/AshishCherian15.png";

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
  overlay: 56,
  showClock: true,
  showAbout: true,
  showFooter: true,
  bgAudio: false,
  bgMuted: true,
  audioVolume: 65,
  creatorName: "Ashish Cherian",
  creatorPhoto: DEFAULT_CREATOR_PHOTO
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
  theme: "dark",
  background: {
    type: "image",
    src: "",
    sourceKind: "url"
  },
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
  themeBtn: document.getElementById("themeBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFile: document.getElementById("importFile"),

  creatorName: document.getElementById("creatorName"),
  creatorPhoto: document.getElementById("creatorPhoto"),
  creatorChip: document.getElementById("creatorChip"),

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
  setOverlay: document.getElementById("setOverlay"),
  setShowClock: document.getElementById("setShowClock"),
  setShowAbout: document.getElementById("setShowAbout"),
  setShowFooter: document.getElementById("setShowFooter"),
  setBgAudio: document.getElementById("setBgAudio"),
  setBgMuted: document.getElementById("setBgMuted"),
  setAudioVolume: document.getElementById("setAudioVolume"),
  setCreatorName: document.getElementById("setCreatorName"),
  setCreatorPhoto: document.getElementById("setCreatorPhoto"),
  uploadCreatorBtn: document.getElementById("uploadCreatorBtn"),
  creatorPhotoUpload: document.getElementById("creatorPhotoUpload"),

  storyDialog: document.getElementById("storyDialog"),
  closeStoryBtn: document.getElementById("closeStoryBtn"),
  storyPhoto: document.getElementById("storyPhoto"),

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

function isValidUrl(value) {
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
  try {
    const source = new URL(url);
    if (source.hostname.includes("youtu.be")) {
      return source.pathname.replace("/", "").split("?")[0];
    }
    if (source.searchParams.get("v")) {
      return source.searchParams.get("v");
    }
    const parts = source.pathname.split("/").filter(Boolean);
    return parts.pop() || "";
  } catch {
    return "";
  }
}

function detectBackgroundType(src) {
  const value = String(src || "").toLowerCase();
  if (value.includes("youtube.com") || value.includes("youtu.be")) {
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
    state.theme = "dark";
    state.background = { type: "image", src: "", sourceKind: "url" };
    state.settings = { ...DEFAULT_SETTINGS };
    saveState();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.shortcuts = Array.isArray(parsed.shortcuts) ? parsed.shortcuts : [...DEFAULT_SHORTCUTS];
    state.theme = parsed.theme === "light" ? "light" : "dark";
    state.background = parsed.background && typeof parsed.background === "object"
      ? {
        type: parsed.background.type || "image",
        src: parsed.background.src || "",
        sourceKind: parsed.background.sourceKind || "url"
      }
      : { type: "image", src: "", sourceKind: "url" };
    state.settings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {})
    };
  } catch {
    state.shortcuts = [...DEFAULT_SHORTCUTS];
    state.theme = "dark";
    state.background = { type: "image", src: "", sourceKind: "url" };
    state.settings = { ...DEFAULT_SETTINGS };
    saveState();
  }
}

function applyTheme() {
  document.body.classList.toggle("light", state.theme === "light");
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
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${mute}&controls=0&loop=1&playlist=${id}&playsinline=1&enablejsapi=1`;
}

function applyBackground() {
  const { bgImage, bgVideo, bgYoutube } = refs;
  bgImage.style.display = "none";
  bgVideo.style.display = "none";
  bgYoutube.style.display = "none";

  if (!state.background.src) {
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
  refs.creatorName.textContent = state.settings.creatorName || "Ashish Cherian";
  const photo = state.settings.creatorPhoto || DEFAULT_CREATOR_PHOTO;
  refs.creatorPhoto.src = photo;
  refs.storyPhoto.src = photo;
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
  const overlayOpacity = Math.max(20, Math.min(85, Number(state.settings.overlay || DEFAULT_SETTINGS.overlay)));
  document.documentElement.style.setProperty("--overlay-alpha", (overlayOpacity / 100).toFixed(2));

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

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}

function openBackgroundDialog() {
  refs.bgType.value = state.background.type || "auto";
  refs.bgSource.value = state.background.sourceKind === "url" ? state.background.src : "";
  refs.bgUpload.value = "";
  openDialog(refs.backgroundDialog);
}

function closeBackgroundDialog() {
  closeDialog(refs.backgroundDialog);
}

function clearBackground() {
  state.background = { type: "image", src: "", sourceKind: "url" };
  refs.bgYoutube.src = "";
  refs.bgVideo.src = "";
  refs.bgImage.src = "";
  applyBackground();
  saveState();
  closeBackgroundDialog();
}

function submitBackground(event) {
  event.preventDefault();
  const typeChoice = refs.bgType.value;
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

  const src = normalizeUrl(refs.bgSource.value.trim());
  if (src && !isValidUrl(src)) {
    alert("Please use a valid background URL.");
    return;
  }

  const resolvedType = typeChoice === "auto" ? detectBackgroundType(src) : typeChoice;

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
  refs.setOverlay.value = String(state.settings.overlay);
  refs.setShowClock.value = state.settings.showClock ? "on" : "off";
  refs.setShowAbout.value = state.settings.showAbout ? "on" : "off";
  refs.setShowFooter.value = state.settings.showFooter ? "on" : "off";
  refs.setBgAudio.value = state.settings.bgAudio ? "on" : "off";
  refs.setBgMuted.value = state.settings.bgMuted ? "on" : "off";
  refs.setAudioVolume.value = String(state.settings.audioVolume);
  refs.setCreatorName.value = state.settings.creatorName;
  refs.setCreatorPhoto.value = state.settings.creatorPhoto;
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
  const creatorPhoto = normalizeUrl(refs.setCreatorPhoto.value.trim());

  if (refs.setSearchEngine.value === "custom" && customUrl && !customUrl.includes("%s")) {
    alert("Custom search URL must include %s placeholder.");
    return;
  }

  if (creatorPhoto && !isValidUrl(creatorPhoto)) {
    alert("Creator photo URL is invalid.");
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
    overlay: Number(refs.setOverlay.value),
    showClock: refs.setShowClock.value === "on",
    showAbout: refs.setShowAbout.value === "on",
    showFooter: refs.setShowFooter.value === "on",
    bgAudio: refs.setBgAudio.value === "on",
    bgMuted: refs.setBgMuted.value === "on",
    audioVolume: Number(refs.setAudioVolume.value),
    creatorName: safeText(refs.setCreatorName.value.trim()) || "Ashish Cherian",
    creatorPhoto: creatorPhoto || DEFAULT_CREATOR_PHOTO
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
  state.theme = "dark";
  state.background = { type: "image", src: "", sourceKind: "url" };
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

function exportData() {
  const blob = new Blob([
    JSON.stringify({
      shortcuts: state.shortcuts,
      theme: state.theme,
      background: serializableBackground(),
      settings: state.settings
    }, null, 2)
  ], { type: "application/json" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = "shortcuthub-backup.json";
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed.shortcuts)) {
        alert("Invalid backup file.");
        return;
      }

      state.shortcuts = parsed.shortcuts;
      state.theme = parsed.theme === "light" ? "light" : "dark";
      state.background = parsed.background && typeof parsed.background === "object"
        ? {
          type: parsed.background.type || "image",
          src: parsed.background.src || "",
          sourceKind: parsed.background.sourceKind || "url"
        }
        : { type: "image", src: "", sourceKind: "url" };
      state.settings = {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {}),
        creatorPhoto: parsed.settings && parsed.settings.creatorPhoto ? parsed.settings.creatorPhoto : DEFAULT_CREATOR_PHOTO
      };

      applyTheme();
      applyBackground();
      applySettingsToUI();
      saveState();
      render();
      refs.importFile.value = "";
    } catch {
      alert("Could not read this backup file.");
    }
  };
  reader.readAsText(file);
}

function updateClock() {
  const now = new Date();
  refs.clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
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

function uploadCreatorPhoto(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.settings.creatorPhoto = String(reader.result || DEFAULT_CREATOR_PHOTO);
    refs.setCreatorPhoto.value = state.settings.creatorPhoto;
    applyCreatorProfile();
    saveState();
  };
  reader.readAsDataURL(file);
}

function maybeShowStory() {
  const seen = localStorage.getItem(FIRST_STORY_KEY) === "1";
  if (seen) {
    return;
  }
  openDialog(refs.storyDialog);
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
  }
}

function initEvents() {
  refs.search.addEventListener("input", render);
  refs.search.addEventListener("keydown", maybeSearchWeb);

  refs.brandBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  refs.creatorChip.addEventListener("click", () => {
    window.location.href = "about.html";
  });

  refs.addBtn.addEventListener("click", () => openShortcutDialog());
  refs.settingsBtn.addEventListener("click", openSettingsDialog);
  refs.themeBtn.addEventListener("click", toggleTheme);
  refs.bgBtn.addEventListener("click", openBackgroundDialog);
  refs.exportBtn.addEventListener("click", exportData);
  refs.importBtn.addEventListener("click", () => refs.importFile.click());
  refs.importFile.addEventListener("change", importData);

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

  refs.uploadCreatorBtn.addEventListener("click", () => refs.creatorPhotoUpload.click());
  refs.creatorPhotoUpload.addEventListener("change", uploadCreatorPhoto);

  refs.audioToggle.addEventListener("click", toggleAudioState);
  refs.closeStoryBtn.addEventListener("click", closeStory);

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
  setInterval(updateClock, 15000);
  initEvents();
  render();
  maybeShowStory();
}

init();
