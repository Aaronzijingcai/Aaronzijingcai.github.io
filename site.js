(() => {
  "use strict";

  const themeKey = "theme-storage";
  const likeKey = "jiale-website-user-liked";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const themes = ["system", "light", "dark"];
  const themeIcons = {
    system: "M3 4h18v12H3zM8 21h8m-4-5v5",
    light: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5",
    dark: "M20.9 14.2A9 9 0 0 1 9.8 3.1a9 9 0 1 0 11.1 11.1Z",
  };

  function readPreference(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function savePreference(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch {
      // The current page still works when the browser blocks storage.
    }
  }

  let theme = "system";
  try {
    const savedTheme = JSON.parse(readPreference(themeKey))?.state?.theme;
    if (themes.includes(savedTheme)) theme = savedTheme;
  } catch {
    // Recover from an invalid saved theme with the system setting.
  }

  function applyTheme() {
    const effectiveTheme = theme === "system" ? (systemTheme.matches ? "dark" : "light") : theme;
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.classList.toggle("light", effectiveTheme === "light");
    root.dataset.theme = effectiveTheme;
    root.style.colorScheme = effectiveTheme;
  }

  applyTheme();
  if (systemTheme.addEventListener) systemTheme.addEventListener("change", applyTheme);
  else systemTheme.addListener(applyTheme);

  document.addEventListener("DOMContentLoaded", () => {
    const navBar = document.querySelector("[data-nav-bar]");
    if (navBar) {
      const scrolledClasses = ["bg-background/80", "backdrop-blur-xl", "border-b", "border-neutral-200/50", "shadow-lg"];

      function updateNavBar() {
        const scrolled = window.scrollY > 20;
        navBar.classList.toggle("bg-transparent", !scrolled);
        for (const className of scrolledClasses) navBar.classList.toggle(className, scrolled);
      }

      updateNavBar();
      window.addEventListener("scroll", updateNavBar, { passive: true });
    }

    const themeButtons = document.querySelectorAll("[data-theme-toggle]");

    function updateThemeButtons() {
      const label = theme[0].toUpperCase() + theme.slice(1);
      const hint = `Current theme: ${label}. Click to cycle theme.`;
      for (const button of themeButtons) {
        button.title = hint;
        button.setAttribute("aria-label", hint);
        const icon = button.querySelector("[data-theme-icon]");
        if (icon) {
          icon.innerHTML = `<svg class="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${themeIcons[theme]}"/></svg>`;
        }
      }
    }

    updateThemeButtons();
    for (const button of themeButtons) {
      button.addEventListener("click", () => {
        theme = themes[(themes.indexOf(theme) + 1) % themes.length];
        savePreference(themeKey, JSON.stringify({ state: { theme }, version: 0 }));
        applyTheme();
        updateThemeButtons();
      });
    }

    const menuButton = document.querySelector("[data-menu-toggle]");
    const menu = menuButton && document.getElementById(menuButton.getAttribute("aria-controls"));
    if (menu) {
      const menuLabel = menuButton.querySelector("[data-menu-label], .sr-only");
      const menuIcon = menuButton.querySelector("svg path");

      function setMenu(open) {
        menu.hidden = !open;
        menuButton.setAttribute("aria-expanded", String(open));
        if (menuLabel) menuLabel.textContent = open ? "Close main menu" : "Open main menu";
        if (menuIcon) menuIcon.setAttribute("d", open ? "M6 18 18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5");
      }

      menuButton.addEventListener("click", () => setMenu(menu.hidden));
      menu.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenu(false);
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !menu.hidden) {
          setMenu(false);
          menuButton.focus();
        }
      });
    }

    const likeButton = document.querySelector("[data-like]");
    if (likeButton) {
      const likeLabel = likeButton.querySelector("[data-like-label]");
      const likeIcon = likeButton.querySelector("svg");
      const likedClasses = ["bg-red-50", "dark:bg-red-900/20", "text-red-600", "dark:text-red-400"];
      const unlikedClasses = ["bg-neutral-100", "dark:bg-neutral-800", "text-neutral-700", "dark:text-neutral-500"];
      let liked = readPreference(likeKey) === "true";

      function updateLikeButton() {
        likeButton.setAttribute("aria-pressed", String(liked));
        likeButton.classList.remove(...(liked ? unlikedClasses : likedClasses));
        likeButton.classList.add(...(liked ? likedClasses : unlikedClasses));
        if (likeLabel) likeLabel.textContent = liked ? "Liked" : "Like";
        if (likeIcon) likeIcon.setAttribute("fill", liked ? "currentColor" : "none");
      }

      updateLikeButton();
      likeButton.addEventListener("click", () => {
        liked = !liked;
        savePreference(likeKey, liked ? "true" : null);
        updateLikeButton();
      });
    }
  });
})();
