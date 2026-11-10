/* Shafi Chowdhury — site interactions. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Contact form: set FORM_ENDPOINT to a form-handling service URL (e.g. Formspree)
     that accepts a JSON POST. While it is empty the form validates input but tells
     the visitor plainly that the message has NOT been sent. */
  var FORM_ENDPOINT = "";

  /* ---------- header and back to top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 900);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    var main = document.getElementById("main"); if (main) main.focus({ preventScroll: true });
  });

  /* ---------- mobile navigation ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".menu-toggle__label").textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1000 && nav.classList.contains("is-open")) setMenu(false); });
  }

  /* ---------- quiet fade for content below the first screen ---------- */
  var fades = [].slice.call(document.querySelectorAll(".fade"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove("is-pending"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    fades.forEach(function (el) { if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("is-pending"); io.observe(el); } });
  }

  /* ---------- career timeline (data: assets/js/timeline.js) ---------- */
  var tl = document.querySelector("[data-timeline]");
  if (tl && Array.isArray(window.SITE_TIMELINE)) {
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var field = function (s, isPh) { return isPh ? '<span class="ph ph--plain">' + esc(s) + "</span>" : esc(s); };
    tl.innerHTML = window.SITE_TIMELINE.map(function (it) {
      return '<li class="tl' + (it.featured ? " tl--key" : "") + '">' +
        '<p class="tl__when">' + esc(it.when) + "</p>" +
        '<div class="tl__body"><p class="tl__org">' + field(it.org, it.orgPlaceholder) + "</p>" +
        '<h3 class="tl__title">' + field(it.title, it.titlePlaceholder) + "</h3>" +
        '<p class="tl__text">' + field(it.text, it.textPlaceholder) + "</p></div></li>";
    }).join("");
  }

  /* ---------- insights filter ---------- */
  var bar = document.querySelector("[data-filters]");
  if (bar) {
    var rows = [].slice.call(document.querySelectorAll("[data-category]"));
    var count = document.querySelector("[data-count-label]"), empty = document.querySelector("[data-empty]");
    bar.addEventListener("click", function (e) {
      var b = e.target.closest(".filter"); if (!b) return;
      [].forEach.call(bar.querySelectorAll(".filter"), function (c) { c.setAttribute("aria-pressed", String(c === b)); });
      var f = b.getAttribute("data-filter"), shown = 0;
      rows.forEach(function (r) { var on = f === "all" || r.getAttribute("data-category") === f; r.hidden = !on; if (on) shown++; });
      if (count) count.textContent = shown + (shown === 1 ? " topic" : " topics");
      if (empty) empty.hidden = shown !== 0;
    });
  }

  /* ---------- contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form__status");
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your full name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address, for example name@company.com."; },
      topic: function (v) { return v ? "" : "Please choose the type of enquiry."; },
      message: function (v) { return v.trim().length >= 20 ? "" : "Please write a message of at least 20 characters."; },
      consent: function (v, el) { return el.checked ? "" : "Please confirm that your details may be used to reply to this enquiry."; }
    };
    function check(el) {
      var msg = rules[el.name](el.value, el), wrap = el.closest(".field") || el.closest(".check"), err = document.getElementById(el.name + "-error");
      if (wrap) wrap.classList.toggle("has-error", !!msg);
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (k) { var el = form.elements[k]; if (el) el.addEventListener("blur", function () { if (el.value || el.type === "checkbox") check(el); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (k) { var el = form.elements[k]; if (el && !check(el) && !firstBad) firstBad = el; });
      status.hidden = false; status.classList.remove("is-err");
      if (firstBad) { status.classList.add("is-err"); status.textContent = "Please correct the highlighted fields."; firstBad.focus(); return; }
      if (form.elements.website && form.elements.website.value) return; // honeypot
      if (!FORM_ENDPOINT) {
        status.textContent = "Your message has not been sent. Online submission is not yet connected, so please use the email address shown on this page.";
        return;
      }
      var btn = form.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "Sending…";
      var data = {}; [].forEach.call(form.elements, function (el) { if (el.name && el.name !== "website") data[el.name] = el.type === "checkbox" ? el.checked : el.value; });
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); status.textContent = "Thank you. Your message has been sent and will be answered by email."; form.reset(); })
        .catch(function () { status.classList.add("is-err"); status.textContent = "Your message could not be sent because the form service did not respond. Please try again or use the email address shown on this page."; })
        .then(function () { btn.disabled = false; btn.textContent = "Send message"; });
    });
  }
})();
