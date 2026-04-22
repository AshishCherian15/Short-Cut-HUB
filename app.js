const STORAGE_KEY = "shortcuthub_data_v2";

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

const state = {
  shortcuts: [],
  editIndex: null,
  theme: "dark",
  background: {
    type: "image",
    src: ""
  }
};

const refs = {
  container: document.getElementById("container"),
  search: document.getElementById("search"),
  clock: document.getElementById("clock"),
  date: document.getElementById("date"),
  addBtn: document.getElementById("addBtn"),
  bgBtn: document.getElementById("bgBtn"),
  themeBtn: document.getElementById("themeBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFile: document.getElementById("importFile"),
  shortcutDialog: document.getElementById("shortcutDialog"),
  shortcutForm: document.getElementById("shortcutForm"),
  dialogTitle: document.getElementById("dialogTitle"),
  cancelDialog: document.getElementById("cancelDialog"),
  backgroundDialog: document.getElementById("backgroundDialog"),
  backgroundForm: document.getElementById("backgroundForm"),
  cancelBackground: document.getElementById("cancelBackground"),
  name: document.getElementById("name"),
  url: document.getElementById("url"),
  group: document.getElementById("group"),
  icon: document.getElementById("icon"),
  bgType: document.getElementById("bgType"),
  bgSource: document.getElementById("bgSource"),
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

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    shortcuts: state.shortcuts,
    theme: state.theme,
    background: state.background
  }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.shortcuts = [...DEFAULT_SHORTCUTS];
    saveState();
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.shortcuts = Array.isArray(parsed.shortcuts) ? parsed.shortcuts : [...DEFAULT_SHORTCUTS];
    state.theme = parsed.theme === "light" ? "light" : "dark";
    if (parsed.background && typeof parsed.background === "object") {
      state.background = {
        type: parsed.background.type || "image",
        src: parsed.background.src || ""
      };
    }
  } catch {
    state.shortcuts = [...DEFAULT_SHORTCUTS];
    state.theme = "dark";
    state.background = { type: "image", src: "" };
    saveState();
  }
}

function applyTheme() {
  document.body.classList.toggle("light", state.theme === "light");
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
    const id = getYoutubeId(state.background.src);
    if (!id) {
      return;
    }
    bgYoutube.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}`;
    bgYoutube.style.display = "block";
    return;
  }

  if (state.background.type === "video") {
    bgVideo.src = state.background.src;
    bgVideo.style.display = "block";
    return;
  }

  bgImage.src = state.background.src;
  bgImage.style.display = "block";
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
  window.open(normalized, "_blank", "noopener,noreferrer");
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
    empty.textContent = "No shortcuts match your search. Try another keyword.";
    refs.container.appendChild(empty);
    return;
  }

  const grouped = groupedShortcuts(filtered);

  Object.keys(grouped).sort().forEach((groupName) => {
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
      card.draggable = true;

      const iconSource = shortcut.icon && isValidUrl(normalizeUrl(shortcut.icon))
        ? normalizeUrl(shortcut.icon)
        : getFavicon(shortcut.url);

      card.innerHTML = `
        <div class="actions">
          <button class="icon-btn edit" title="Edit">E</button>
          <button class="icon-btn delete" title="Delete">X</button>
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
        event.dataTransfer.setData("text/plain", String(index));
      });

      card.addEventListener("dragover", (event) => {
        event.preventDefault();
      });

      card.addEventListener("drop", (event) => {
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
  refs.shortcutDialog.showModal();
}

function closeShortcutDialog() {
  refs.shortcutDialog.close();
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

  const accepted = confirm(`Delete shortcut "${item.name}"?`);
  if (!accepted) {
    return;
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
  refs.bgType.value = state.background.type;
  refs.bgSource.value = state.background.src;
  refs.backgroundDialog.showModal();
}

function closeBackgroundDialog() {
  refs.backgroundDialog.close();
}

function submitBackground(event) {
  event.preventDefault();
  const type = refs.bgType.value;
  const src = refs.bgSource.value.trim();

  if (src && !isValidUrl(normalizeUrl(src))) {
    alert("Please use a valid background URL.");
    return;
  }

  state.background = {
    type,
    src: normalizeUrl(src)
  };

  applyBackground();
  saveState();
  closeBackgroundDialog();
}

function exportData() {
  const blob = new Blob([
    JSON.stringify({
      shortcuts: state.shortcuts,
      theme: state.theme,
      background: state.background
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
          src: parsed.background.src || ""
        }
        : { type: "image", src: "" };

      applyTheme();
      applyBackground();
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

function initEvents() {
  refs.search.addEventListener("input", render);
  refs.addBtn.addEventListener("click", () => openShortcutDialog());
  refs.themeBtn.addEventListener("click", toggleTheme);
  refs.bgBtn.addEventListener("click", openBackgroundDialog);
  refs.exportBtn.addEventListener("click", exportData);
  refs.importBtn.addEventListener("click", () => refs.importFile.click());
  refs.importFile.addEventListener("change", importData);

  refs.shortcutForm.addEventListener("submit", submitShortcut);
  refs.cancelDialog.addEventListener("click", closeShortcutDialog);

  refs.backgroundForm.addEventListener("submit", submitBackground);
  refs.cancelBackground.addEventListener("click", closeBackgroundDialog);
}

function init() {
  loadState();
  applyTheme();
  applyBackground();
  updateClock();
  setInterval(updateClock, 15000);
  initEvents();
  render();
}

init();
