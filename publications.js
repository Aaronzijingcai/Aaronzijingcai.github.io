const publications = document.querySelector("[data-publications]");
const search = publications.querySelector("input[type='search']");
const filterToggle = publications.querySelector("#publication-filter-toggle");
const filters = document.getElementById(filterToggle.getAttribute("aria-controls"));
const emptyState = publications.querySelector("[data-no-results]");
const activeFilters = { year: "", type: "" };

const cards = Array.from(publications.querySelectorAll("[data-publication]"), element => ({
  element,
  year: element.querySelector("time").dateTime,
  type: element.dataset.publication,
  searchable: Array.from(element.querySelectorAll("[data-search-field]"), field =>
    field.textContent.trim().replace(/\s+/g, " ").toLowerCase()
  ),
}));

function updateResults() {
  const query = search.value.trim().toLowerCase();
  let hasResults = false;

  for (const card of cards) {
    const matchesSearch = card.searchable.some(field => field.includes(query));
    const matchesYear = !activeFilters.year || card.year === activeFilters.year;
    const matchesType = !activeFilters.type || card.type === activeFilters.type;
    const visible = matchesSearch && matchesYear && matchesType;
    card.element.hidden = !visible;
    hasResults ||= visible;
  }

  emptyState.hidden = hasResults;
}

function styleSelection(button, selected, inactiveClasses) {
  for (const className of inactiveClasses) {
    button.classList.toggle(className, !selected);
  }
  button.classList.toggle("bg-accent", selected);
  button.classList.toggle("text-white", selected);
}

function buildChoices(key, values) {
  const choices = filters.querySelector(`[data-filter="${key}"]`);
  const inactiveClasses = ["bg-white", "dark:bg-neutral-800", "text-neutral-600", "hover:bg-neutral-100", "dark:hover:bg-neutral-700"];

  for (const value of ["", ...values]) {
    const button = document.createElement("button");
    button.type = "button";
    button.value = value;
    button.className = "px-3 py-1 text-xs rounded-full transition-colors";
    button.textContent = value ? value[0].toUpperCase() + value.slice(1).replaceAll("-", " ") : "All";
    button.setAttribute("aria-pressed", String(!value));
    styleSelection(button, !value, inactiveClasses);
    choices.append(button);

    button.addEventListener("click", () => {
      activeFilters[key] = value;
      for (const choice of choices.querySelectorAll("button")) {
        const selected = choice === button;
        choice.setAttribute("aria-pressed", String(selected));
        styleSelection(choice, selected, inactiveClasses);
      }
      updateResults();
    });
  }
}

buildChoices("year", [...new Set(cards.map(card => card.year))].sort((a, b) => Number(b) - Number(a)));
buildChoices("type", [...new Set(cards.map(card => card.type))].sort());
search.addEventListener("input", updateResults);
updateResults();

filterToggle.addEventListener("click", () => {
  const expanded = filters.hidden;
  filters.hidden = !expanded;
  filterToggle.setAttribute("aria-expanded", String(expanded));
});

const activeDisclosures = new Map();
const disclosureClasses = ["bg-neutral-100", "dark:bg-neutral-800", "text-neutral-700", "dark:text-neutral-300"];

function setDisclosure(button, expanded) {
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  panel.hidden = !expanded;
  button.setAttribute("aria-expanded", String(expanded));
  styleSelection(button, expanded, disclosureClasses);
}

for (const button of publications.querySelectorAll("[data-publication-disclosure]")) {
  const group = button.dataset.publicationDisclosure;
  button.addEventListener("click", () => {
    const previous = activeDisclosures.get(group);
    if (previous) setDisclosure(previous, false);
    if (previous === button) {
      activeDisclosures.delete(group);
      return;
    }

    setDisclosure(button, true);
    activeDisclosures.set(group, button);
  });
}

for (const button of publications.querySelectorAll("[data-copy-bibtex]")) {
  const citation = button.parentElement.previousElementSibling;
  const status = button.parentElement.querySelector("[role='status']");
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(citation.textContent);
      status.textContent = "Copied.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Citation selected. Use your browser’s copy command.";
    }
  });
}
