"use strict";

const anglais = document.documentElement.lang === "en";

/* Thème : automatique (réglage du système), clair ou sombre. */

const THEMES = ["auto", "clair", "sombre"];
const NOMS = anglais
  ? { auto: "Theme: automatic", clair: "Theme: light", sombre: "Theme: dark" }
  : { auto: "Thème : automatique", clair: "Thème : clair", sombre: "Thème : sombre" };

function lireTheme() {
  try {
    return localStorage.getItem("theme") ?? "auto";
  } catch {
    return "auto";
  }
}

function appliquerTheme(theme) {
  const racine = document.documentElement;
  if (theme === "auto") delete racine.dataset.theme;
  else racine.dataset.theme = theme === "clair" ? "light" : "dark";
  document.getElementById("theme").textContent = NOMS[theme];
  try {
    theme === "auto" ? localStorage.removeItem("theme") : localStorage.setItem("theme", theme);
  } catch {}
}

const bouton = document.getElementById("theme");
let theme = lireTheme();
appliquerTheme(theme);
bouton.addEventListener("click", () => {
  theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  appliquerTheme(theme);
});

/* Aperçu de la chronologie, dessiné à partir de ses vraies données. */

async function dessinerFrise() {
  const conteneur = document.getElementById("frise-mini");
  if (!conteneur) return;
  const base = "/vieux-monde/donnees/";
  const [ref, ...lots] = await Promise.all(
    ["referentiel.json", "evenements-anciens.json", "evenements-empire.json"].map((f) =>
      fetch(base + f).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ),
  );

  const total = ref.eres.reduce((s, e) => s + e.poids, 0);
  const position = (annee) => {
    let cumul = 0;
    for (const ere of ref.eres) {
      if (annee < ere.fin || ere === ref.eres.at(-1)) {
        const t = Math.min(Math.max((annee - ere.debut) / (ere.fin - ere.debut), 0), 1);
        return (cumul + t * ere.poids) / total;
      }
      cumul += ere.poids;
    }
    return 1;
  };
  const couleurs = Object.fromEntries(ref.factions.map((f) => [f.id, f.couleur]));

  for (const ev of lots.flat()) {
    const trait = document.createElement("span");
    trait.className = "trait";
    trait.dataset.importance = ev.importance;
    trait.style.left = `${position(ev.annee) * 100}%`;
    trait.style.background = couleurs[ev.factions[0]] ?? "currentColor";
    conteneur.append(trait);
  }
}

/* Date de dernière mise à jour des dépôts, lue sur GitHub. */

async function datesDepots() {
  for (const projet of document.querySelectorAll("[data-depot]")) {
    const r = await fetch(`https://api.github.com/repos/alexisjubin/${projet.dataset.depot}`);
    if (!r.ok) continue;
    const { pushed_at } = await r.json();
    const date = new Date(pushed_at).toLocaleDateString(anglais ? "en-GB" : "fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });
    projet.querySelector(".maj").textContent = anglais ? `, updated ${date}` : `, mis à jour le ${date}`;
  }
}

dessinerFrise().catch(() => {});
datesDepots().catch(() => {});
