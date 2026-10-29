// Chargé dans <head>, avant la feuille de style, pour éviter un flash du mauvais thème.
(function () {
  var choix = null;
  try {
    choix = localStorage.getItem("theme");
  } catch (e) {}
  if (choix === "clair" || choix === "sombre") {
    document.documentElement.dataset.theme = choix === "clair" ? "light" : "dark";
  }
})();
