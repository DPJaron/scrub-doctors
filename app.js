/* ============================================================
   THE SCRUB DOCTORS — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- NAV scroll state ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 28) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector(".burger");
  const mobile = document.querySelector(".mobile-menu");
  if (burger && mobile) {
    burger.addEventListener("click", () => {
      const open = mobile.classList.toggle("open");
      burger.classList.toggle("x", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobile.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobile.classList.remove("open");
        burger.classList.remove("x");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- scroll reveal (rAF + getBoundingClientRect; IO is unreliable in some sandboxes) ---------- */
  const revEls = Array.from(document.querySelectorAll(".reveal, .reveal-x"));
  let revTicking = false;
  function checkReveals() {
    revTicking = false;
    const trigger = window.innerHeight * 0.9;
    for (let i = revEls.length - 1; i >= 0; i--) {
      const el = revEls[i];
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add("in");
        revEls.splice(i, 1);
        // failsafe: if the transition clock is throttled (background/sandbox),
        // force the end-state so content is never stuck invisible.
        (function (node) {
          setTimeout(function () {
            if (getComputedStyle(node).opacity < 0.99) {
              node.style.transition = "none";
              node.style.opacity = "1";
              node.style.transform = "none";
            }
          }, 1300);
        })(el);
      }
    }
  }
  function requestReveals() {
    // call directly — rAF is throttled in background/sandbox iframes
    checkReveals();
  }
  window.addEventListener("scroll", requestReveals, { passive: true });
  window.addEventListener("resize", requestReveals);
  checkReveals();

  /* ---------- hero bubbles ---------- */
  const bubbleHost = document.querySelector(".hero-stage");
  if (bubbleHost) {
    const N = 14;
    for (let i = 0; i < N; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      const size = 6 + Math.random() * 22;
      b.style.width = b.style.height = size + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.bottom = Math.random() * 40 + "%";
      b.style.animationDuration = 5 + Math.random() * 7 + "s";
      b.style.animationDelay = Math.random() * 6 + "s";
      bubbleHost.appendChild(b);
    }
  }

  /* ---------- DOC GUIDE narrator ---------- */
  const guide = document.querySelector(".doc-guide");
  const bubble = document.querySelector(".doc-bubble");
  const bubbleBody = document.querySelector(".doc-bubble .body");
  const bubbleTitle = document.querySelector(".doc-bubble .gtitle");
  const docImg = document.querySelector(".doc-figure img");
  const reopen = document.querySelector(".doc-reopen");
  let dismissed = false;
  let currentKey = "";

  const POSES = {
    point: "img/doc-wink.png",
    walk: "img/doc-walk.png",
    hero: "img/doc-hero.png",
  };

  // narration per section
  const lines = {
    services: { t: "Our Services", b: "Inside or out, every pane gets the full treatment. Tap a card to see how.", pose: "point" },
    process: { t: "The 4-Step Checkup", b: "This is my prescription for spotless glass — follow me through it!", pose: "walk" },
    area: { t: "House Calls", b: "Main Line, South Jersey, North Delaware — I make house calls all over.", pose: "point" },
    why: { t: "Why The Doctors", b: "Spot-free guaranteed. If it's not perfect, I come right back. Promise!", pose: "hero" },
    reviews: { t: "Neighbor Approved", b: "Don't take my word for it — hear what your neighbors are saying!", pose: "walk" },
    plans: { t: "Memberships", b: "Pick a plan, lock in your savings, and never think about windows again.", pose: "hero" },
    quote: { t: "Let's Talk", b: "Ready for sparkling windows? Fill this out and I'll be in touch!", pose: "point" },
  };

  function setLine(key) {
    if (!guide || dismissed || key === currentKey) return;
    const data = lines[key];
    if (!data) return;
    currentKey = key;
    bubble.classList.add("swap");
    setTimeout(() => {
      bubbleTitle.textContent = data.t;
      bubbleBody.textContent = data.b;
      if (POSES[data.pose]) docImg.src = POSES[data.pose];
      bubble.classList.remove("swap");
    }, 320);
  }

  let guideForced = false;
  function applyForced(show) {
    guide.style.transition = "none";
    if (bubble) bubble.style.transition = "none";
    if (show) {
      guide.style.opacity = "1";
      guide.style.transform = "translateY(0) scale(1)";
    } else {
      guide.style.opacity = "0";
      guide.style.transform = "translateY(160%) scale(.8)";
    }
  }
  function showGuide() {
    if (!guide || dismissed) return;
    guide.classList.add("show");
    if (guideForced) { applyForced(true); return; }
    setTimeout(function () {
      if (dismissed || !guide.classList.contains("show")) return;
      if (parseFloat(getComputedStyle(guide).opacity) < 0.5) {
        guideForced = true;
        applyForced(true);
      }
    }, 700);
  }
  function hideGuide() {
    if (!guide) return;
    guide.classList.remove("show");
    if (guideForced) applyForced(false);
  }

  // section tracking via scroll position (IO unreliable in some sandboxes)
  const guideSections = Array.from(document.querySelectorAll("[data-guide]"));
  let guideTicking = false;
  function checkGuide() {
    guideTicking = false;
    const probe = window.innerHeight * 0.5; // viewport midline
    let active = null;
    for (const s of guideSections) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) { active = s; break; }
    }
    if (!active) return;
    const key = active.getAttribute("data-guide");
    if (key === "hero") { hideGuide(); }
    else if (lines[key]) { showGuide(); setLine(key); }
  }
  function requestGuide() {
    checkGuide();
  }
  window.addEventListener("scroll", requestGuide, { passive: true });
  window.addEventListener("resize", requestGuide);
  checkGuide();

  // dismiss / reopen
  const closeBtn = document.querySelector(".doc-bubble .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      dismissed = true;
      guide.classList.remove("show");
      guide.classList.add("hidden");
      if (guideForced) applyForced(false);
      setTimeout(() => reopen.classList.add("show"), 400);
    });
  }
  if (reopen) {
    reopen.addEventListener("click", () => {
      dismissed = false;
      reopen.classList.remove("show");
      guide.classList.remove("hidden");
      showGuide();
    });
  }
  // little wave when you click him
  if (docImg) {
    docImg.parentElement.addEventListener("click", () => {
      docImg.parentElement.animate(
        [{ transform: "rotate(-2deg)" }, { transform: "rotate(14deg) scale(1.08)" }, { transform: "rotate(-8deg)" }, { transform: "rotate(0)" }],
        { duration: 700, easing: "ease-in-out" }
      );
    });
  }

  /* ---------- REVIEWS CAROUSEL ---------- */
  const track = document.querySelector(".rev-track");
  if (track) {
    const cards = Array.from(track.children);
    const dotsWrap = document.querySelector(".rev-dots");
    const prevBtn = document.querySelector(".rev-arrow.prev");
    const nextBtn = document.querySelector(".rev-arrow.next");
    let index = 0;
    let perView = 3;
    let autoTimer = null;

    const computePerView = () => {
      const w = window.innerWidth;
      perView = w <= 680 ? 1 : w <= 980 ? 2 : 3;
    };

    const maxIndex = () => Math.max(0, cards.length - perView);

    const buildDots = () => {
      dotsWrap.innerHTML = "";
      const pages = maxIndex() + 1;
      for (let i = 0; i < pages; i++) {
        const b = document.createElement("button");
        b.setAttribute("aria-label", "Go to review " + (i + 1));
        b.addEventListener("click", () => {
          index = i;
          update();
          restartAuto();
        });
        dotsWrap.appendChild(b);
      }
    };

    const update = () => {
      const card = cards[0];
      const style = getComputedStyle(card);
      const gap = parseFloat(style.marginRight) || 24;
      const step = card.offsetWidth + gap;
      if (index > maxIndex()) index = maxIndex();
      track.style.transform = `translateX(${-step * index}px)`;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle("on", i === index));
    };

    const next = () => { index = index >= maxIndex() ? 0 : index + 1; update(); };
    const prev = () => { index = index <= 0 ? maxIndex() : index - 1; update(); };

    if (nextBtn) nextBtn.addEventListener("click", () => { next(); restartAuto(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); restartAuto(); });

    const startAuto = () => { autoTimer = setInterval(next, 3500); };
    const restartAuto = () => { clearInterval(autoTimer); startAuto(); };

    const viewport = document.querySelector(".rev-viewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", () => clearInterval(autoTimer));
      viewport.addEventListener("mouseleave", startAuto);
    }

    // drag / swipe with live finger-follow + axis lock (smooth on mobile)
    let down = false, sX = 0, sY = 0, dragging = false, decided = false, baseT = 0;
    const stepPx = () => {
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(card).marginRight) || 0;
      return card.offsetWidth + gap;
    };
    const onDown = (x, y) => {
      down = true; sX = x; sY = y; dragging = false; decided = false;
      baseT = -stepPx() * index;
      clearInterval(autoTimer);
      track.style.transition = "none";
    };
    const onMove = (x, y) => {
      if (!down) return false;
      const dx = x - sX, dy = y - sY;
      if (!decided) {
        if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return false;
        decided = true; dragging = Math.abs(dx) > Math.abs(dy);
        if (!dragging) { down = false; track.style.transition = ""; startAuto(); return false; }
      }
      if (dragging) { track.style.transform = `translateX(${baseT + dx}px)`; return true; }
      return false;
    };
    const onUp = (x) => {
      if (!down) return;
      down = false;
      track.style.transition = "";
      if (dragging) {
        const dx = x - sX;
        if (dx < -45) next(); else if (dx > 45) prev(); else update();
      }
      dragging = false; decided = false;
      restartAuto();
    };
    track.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", (e) => onUp(e.clientX));
    track.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    track.addEventListener("touchmove", (e) => { if (onMove(e.touches[0].clientX, e.touches[0].clientY) && e.cancelable) e.preventDefault(); }, { passive: false });
    track.addEventListener("touchend", (e) => onUp((e.changedTouches[0] || { clientX: sX }).clientX));

    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { computePerView(); buildDots(); update(); }, 150);
    });

    computePerView();
    buildDots();
    update();
    startAuto();
  }

  /* ---------- PLAN -> form prefill ---------- */
  const planSelect = document.getElementById("plan-select");
  document.querySelectorAll("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const plan = btn.getAttribute("data-plan");
      if (planSelect) {
        planSelect.value = plan;
        planSelect.animate(
          [{ boxShadow: "0 0 0 0 rgba(88,198,230,0)" }, { boxShadow: "0 0 0 6px rgba(88,198,230,.35)" }, { boxShadow: "0 0 0 0 rgba(88,198,230,0)" }],
          { duration: 1100, easing: "ease-out" }
        );
      }
      const target = document.getElementById("request-quote") || document.getElementById("quote");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- window stepper ---------- */
  const stepper = document.querySelector(".win-stepper");
  if (stepper) {
    const input = stepper.querySelector("input");
    stepper.querySelector(".minus").addEventListener("click", () => {
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
    });
    stepper.querySelector(".plus").addEventListener("click", () => {
      input.value = Math.min(200, (parseInt(input.value, 10) || 0) + 1);
    });
  }

  /* ---------- form submit (client-side only) ---------- */
  const form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const wrap = document.querySelector(".qform");
      const nameVal = (form.querySelector('[name="name"]').value || "there").split(" ")[0];
      const okName = document.querySelector(".success-name");
      if (okName) okName.textContent = nameVal;
      wrap.classList.add("done");
      wrap.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- service checkboxes (class toggle for reliable :checked styling) ---------- */
  document.querySelectorAll(".svc-check input").forEach((cb) => {
    const sync = () => { const w = cb.closest(".svc-check"); if (w) w.classList.toggle("on", cb.checked); };
    cb.addEventListener("change", sync);
    sync();
  });

  /* ---------- footer year ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

})();
