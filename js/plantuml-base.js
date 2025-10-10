(function () {
  const OFFICIAL = "https://www.plantuml.com/plantuml";
  const KEY = "plantuml_base";

  function sanitize(u) {
    if (!u) return OFFICIAL;
    let x = String(u).trim();
    if (!/^https:\/\//i.test(x)) x = "https://" + x.replace(/^http:\/\//i, "");
    return x.replace(/\/+$/, "");
  }

  window.getPlantumlBase = function () {
    const saved = localStorage.getItem(KEY);
    return sanitize(saved || OFFICIAL);
  };

  window.setPlantumlBase = function (url) {
    localStorage.setItem(KEY, sanitize(url));
  };
})();

