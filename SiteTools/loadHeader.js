// darkMode.js — shared dark mode utilities for TTWR Tools.
// Load this before loadHeader.js and any page script.

function refreshDropdownStyles() {
  const cs = getComputedStyle(document.documentElement);
  document.querySelectorAll(".autocomplete-items").forEach(el => {
    el.style.border = `1px solid ${cs.getPropertyValue("--border").trim()}`;
    el.style.backgroundColor = cs.getPropertyValue("--surface").trim();
  });
}

function enableDarkMode(save = true) {
  document.body.classList.add("dark");
  const toggle = document.getElementById("darkModeToggle");
  if (toggle) toggle.textContent = "☀ Light Mode";
  refreshDropdownStyles();
  if (save && typeof savePrefs === "function") savePrefs();
}

function disableDarkMode(save = true) {
  document.body.classList.remove("dark");
  const toggle = document.getElementById("darkModeToggle");
  if (toggle) toggle.textContent = "🌙 Dark Mode";
  refreshDropdownStyles();
  if (save && typeof savePrefs === "function") savePrefs();
}

// Apply dark mode from session storage immediately on load to avoid flash.
// Pages with page-specific prefs (playerName etc.) handle their own restorePrefs.
(function applyDarkModeEarly() {
  try {
    const prefs = JSON.parse(localStorage.getItem("sitePrefs") || "{}");
    if (prefs.darkMode) {
      document.body.classList.add("dark");
      // Toggle text will be set once the header is injected by loadHeader.js
    }
  } catch (e) {}
})();

// Injects the shared site header into #header-placeholder and wires dark mode.

var playerName = localStorage.getItem("sitePrefs") ? JSON.parse(localStorage.getItem("sitePrefs")).playerName || "Player" : "Player";

(function () {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return;
 
  placeholder.innerHTML = `
    <header id="site-header">
      <div class="header-inner">
        <span class="site-title">TTWR Tools</span>
        <nav>
          <a href="/TTWRTools/SpellScribing">Spell Scribing</a>
          <a href="/TTWRTools/CraftingMaterialSearch">Crafting Material Search</a>
        </nav>
        <span>Hi, <span id="playerNameDisplay">${playerName}</span>! <a href="/TTWRTools/Profile" style="color:#a8d8ea;">⚙️ Edit Profile</a></span>
        <button id="darkModeToggle">🌙 Dark Mode</button>
      </div>
    </header>
  `;
 
  // Set correct toggle label based on current state (darkMode.js may have already applied the class)
  const toggle = document.getElementById("darkModeToggle");
  if (document.body.classList.contains("dark")) toggle.textContent = "☀ Light Mode";
 
  toggle.addEventListener("click", () => {
    document.body.classList.contains("dark") ? disableDarkMode() : enableDarkMode();
  });
})();

// Save/restore site-wide preferences (player name, dark mode)
function savePrefs() {
  localStorage.setItem("sitePrefs", JSON.stringify({
    playerName: document.getElementById("playerName") ? document.getElementById("playerName").value : null,
    darkMode: document.body.classList.contains("dark"),
    legacyCharacter: document.getElementById("legacyCharacter") ? document.getElementById("legacyCharacter").checked : null
  }));
    document.getElementById("playerNameDisplay").textContent = document.getElementById("playerName") ? document.getElementById("playerName").value : playerName;

}

function restorePrefs() {
  const raw = localStorage.getItem("sitePrefs");
  if (!raw) return;
  const prefs = JSON.parse(raw);
  if (prefs.playerName) {
    playerName = prefs.playerName;
    document.getElementById("playerNameDisplay").textContent = prefs.playerName;
    document.getElementById("playerName").value = prefs.playerName;
  }
  if (prefs.darkMode) enableDarkMode(false);
  if (prefs.legacyCharacter) document.getElementById("legacyCharacter").checked = true;
}
 

