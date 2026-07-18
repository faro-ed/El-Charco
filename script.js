/* =========================================================
   CHARCO · Salón de Eventos con Piscina — script.js
   Vanilla JS · IIFE · sin dependencias · a prueba de fallos
   ========================================================= */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var WA = "526691620951";

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[charco] " + name + " falló:", e); }
  }

  /* ---------- SPLASH (doble red de seguridad) ---------- */
  function initSplash() {
    var s = $("#splash");
    if (!s) return;
    var hide = function () {
      s.classList.add("hide");
      setTimeout(function () { if (s && s.parentNode) s.parentNode.removeChild(s); }, 700);
    };
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", function () { setTimeout(hide, 450); });
    setTimeout(hide, 2300); // nunca bloquear la página
  }

  /* ---------- HEADER scroll ---------- */
  function initHeader() {
    var h = $(".site-header");
    if (!h) return;
    var onScroll = function () { h.classList.toggle("scrolled", window.scrollY > 14); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- MOBILE NAV ---------- */
  function initNav() {
    var btn = $("#navToggle"), nav = $("#nav");
    if (!btn || !nav) return;
    var close = function () {
      nav.classList.remove("open");
      document.body.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
    };
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("#nav a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- REVEAL (content-first / preview-safe) ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) return; // todo queda visible

    document.body.classList.add("canreveal");
    var reveal = function (el) { el.classList.add("is-in"); };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });

    var revealInView = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.96 && r.bottom > 0) reveal(el);
      });
    };
    requestAnimationFrame(revealInView);
    window.addEventListener("scroll", revealInView, { passive: true });

    // RED DE SEGURIDAD: nada se queda oculto (preview congela transiciones)
    setTimeout(function () { els.forEach(reveal); }, 2600);
    setTimeout(function () { document.body.classList.remove("canreveal"); }, 5200);
  }

  /* ---------- CONTADORES ---------- */
  function initCounters() {
    var nums = $$(".stat__num");
    if (!nums.length) return;
    var done = false;

    var run = function () {
      if (done) return; done = true;
      nums.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-count") || "0");
        var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
        var dur = 1400, start = null;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = dec ? val.toFixed(dec) : Math.round(val).toString();
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = dec ? target.toFixed(dec) : Math.round(target).toString();
        };
        requestAnimationFrame(step);
      });
    };
    var setFinal = function () {
      nums.forEach(function (el) {
        var t = parseFloat(el.getAttribute("data-count") || "0");
        var d = parseInt(el.getAttribute("data-dec") || "0", 10);
        el.textContent = d ? t.toFixed(d) : Math.round(t).toString();
      });
    };

    var stats = $(".stats");
    if ("IntersectionObserver" in window && stats) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { run(); io.disconnect(); }
      }, { threshold: 0.25 });
      io.observe(stats);
    } else { run(); }
    setTimeout(function () { if (!done) { setFinal(); done = true; } }, 2500);
  }

  /* ---------- GALERÍA: filtros ---------- */
  function initFilters() {
    var chips = $$(".gallery__filters .chip"), items = $$(".gItem");
    if (!chips.length) return;
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var f = chip.getAttribute("data-filter");
        items.forEach(function (it) {
          var show = (f === "all" || it.getAttribute("data-cat") === f);
          it.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---------- LIGHTBOX ---------- */
  function initLightbox() {
    var lb = $("#lightbox"), img = $("#lbImg"), cap = $("#lbCap");
    var items = $$(".gItem");
    if (!lb || !img || !items.length) return;
    var idx = 0;
    var visible = function () { return items.filter(function (b) { return !b.classList.contains("is-hidden"); }); };
    var pool = items;

    var show = function (i) {
      pool = visible();
      if (!pool.length) return;
      idx = (i + pool.length) % pool.length;
      var b = pool[idx];
      img.src = b.getAttribute("data-img"); img.alt = b.getAttribute("data-cap") || "";
      cap.textContent = b.getAttribute("data-cap") || "";
    };
    var open = function (b) { pool = visible(); idx = pool.indexOf(b); show(idx); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); };
    var close = function () { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); };

    items.forEach(function (b) { b.addEventListener("click", function () { open(b); }); });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", function () { show(idx - 1); });
    $("#lbNext").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- MAPA (fachada -> carga al hacer clic) ---------- */
  function initMap() {
    var btn = $("#mapBtn"), host = $("#mapFacade");
    if (!btn || !host) return;
    btn.addEventListener("click", function () {
      if (host.querySelector("iframe")) return;
      var ifr = document.createElement("iframe");
      ifr.src = "https://www.google.com/maps?q=Charco%20Sal%C3%B3n%20de%20Eventos%2C%2021%20de%20Marzo%2C%20Colosio%2C%20Mazatl%C3%A1n%2C%20Sinaloa&output=embed";
      ifr.loading = "lazy";
      ifr.referrerPolicy = "no-referrer-when-downgrade";
      ifr.title = "Ubicación de Charco Salón de Eventos en Mazatlán";
      ifr.setAttribute("allowfullscreen", "");
      host.innerHTML = "";
      host.appendChild(ifr);
    });
  }

  /* ---------- FORM -> WhatsApp ---------- */
  function initForm() {
    var form = $("#waForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = (($("#f-nombre") || {}).value || "").trim();
      var tipo = (($("#f-tipo") || {}).value || "").trim();
      var fecha = (($("#f-fecha") || {}).value || "").trim();
      var inv = (($("#f-invitados") || {}).value || "").trim();
      var tel = (($("#f-tel") || {}).value || "").trim();
      var msg = (($("#f-mensaje") || {}).value || "").trim();

      if (!nombre) { var n = $("#f-nombre"); if (n) { n.focus(); n.style.borderColor = "#F0488F"; } return; }

      var t = "¡Hola Charco! Quiero información para mi evento.\n";
      t += "\n• Nombre: " + nombre;
      t += "\n• Evento: " + tipo;
      if (fecha) t += "\n• Fecha: " + fecha;
      if (inv) t += "\n• Invitados: " + inv;
      if (tel) t += "\n• Tel: " + tel;
      if (msg) t += "\n• Mensaje: " + msg;

      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(t), "_blank");
    });
  }

  /* ---------- AÑO ---------- */
  function initYear() {
    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- BOOT ---------- */
  function boot() {
    safe(initSplash, "splash");
    safe(initHeader, "header");
    safe(initNav, "nav");
    safe(initReveal, "reveal");
    safe(initCounters, "counters");
    safe(initFilters, "filters");
    safe(initLightbox, "lightbox");
    safe(initMap, "map");
    safe(initForm, "form");
    safe(initYear, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
