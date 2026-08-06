(function () {
  "use strict";

  var sectionId = "research-roadmap";

  function isHomePage() {
    return window.location.pathname === "/" || window.location.pathname === "/index.html";
  }

  function syncLastUpdated() {
    var footerText = document.querySelector("footer p.text-xs.text-neutral-500");
    if (!footerText || footerText.textContent.indexOf("Last updated:") !== 0) return;

    var modifiedAt = new Date(document.lastModified);
    if (Number.isNaN(modifiedAt.getTime())) return;

    var formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(modifiedAt);
    var nextText = "Last updated: " + formattedDate;

    if (footerText.textContent !== nextText) {
      footerText.textContent = nextText;
    }
  }

  function syncRoadmap() {
    var existing = document.getElementById(sectionId);

    if (!isHomePage()) {
      if (existing) existing.remove();
      return;
    }

    if (existing) return;

    var contentColumn = document.querySelector("main .lg\\:col-span-2.space-y-8");
    if (!contentColumn) return;

    var aboutSection = contentColumn.querySelector("section#about");
    if (!aboutSection) return;

    var section = document.createElement("section");
    section.id = sectionId;
    section.setAttribute("aria-labelledby", "research-roadmap-title");
    section.style.minWidth = "0";

    var title = document.createElement("h2");
    title.id = "research-roadmap-title";
    title.className = "text-2xl font-serif font-bold text-primary mb-2";
    title.textContent = "Research Map";

    var description = document.createElement("p");
    description.className = "text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4";
    description.textContent = "My research interests center on native multimodal self-evolving agents. Recently, I have primarily focused on multimodal DeepResearch agents.";

    var link = document.createElement("a");
    link.href = "/roadmap.png";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = "Open the research roadmap at full resolution";
    link.style.display = "block";
    link.style.overflow = "hidden";
    link.style.border = "1px solid var(--neutral-200)";
    link.style.borderRadius = "8px";
    link.style.background = "#ffffff";

    var image = document.createElement("img");
    image.src = "/roadmap.png";
    image.alt = "Research roadmap towards a native multimodal self-evolving agent";
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 3217;
    image.height = 1031;
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = "auto";

    link.appendChild(image);
    section.appendChild(title);
    section.appendChild(description);
    section.appendChild(link);
    aboutSection.insertBefore(section, aboutSection.children[1] || null);
  }

  function syncEnhancements() {
    syncLastUpdated();
    syncRoadmap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncEnhancements, { once: true });
  } else {
    syncEnhancements();
  }

  new MutationObserver(syncEnhancements).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
