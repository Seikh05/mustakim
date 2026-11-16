/* face-3d.js — interactive head-tracking avatar for the hero section.
 *
 * Pre-cropped, yaw-sorted photos are cross-faded on a canvas, driven by the pointer / touch drag /
 * device gyroscope, with a CSS 3D perspective tilt on the viewport.
 *
 * Entry point: window.initFaceAvatar(rootElement). Needs the markup built in site.js.
 */
(function () {
  "use strict";

  const FRAME_COUNT = 15;
  const FRAME_DIR = "assets/mustakim_face/frames/";

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // OS "reduce motion" setting. A visitor can force full motion with ?motion=full (remembered) or
  // localStorage.motion = "full"; ?motion=reduced clears it.
  const forceFull = (() => {
    try {
      const m = /[?&]motion=(full|reduced)/.exec(location.search);
      if (m) localStorage.setItem("motion", m[1]);
      return localStorage.getItem("motion") === "full";
    } catch (_) { return false; }
  })();
  const isReducedMotion = () => Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) && !forceFull;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function initFaceAvatar(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "1";

    const tiltEl = root.querySelector(".avatar-viewport");
    const canvas = root.querySelector("#avatar-canvas");
    const fallback = root.querySelector(".avatar-fallback");
    const hero = root.closest(".hero-section") || root;
    const ctx = canvas.getContext("2d");

    // Crisper canvas on high-DPI screens (markup keeps the 300x300 default).
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const CSIZE = Math.round(300 * dpr);
    canvas.width = CSIZE;
    canvas.height = CSIZE;

    /* ---------------- input state ---------------- */
    const input = { x: 0, y: 0, last: -1e9 }; // normalized [-1, 1] targets
    const smooth = { x: 0, y: 0 };             // eased values
    let dragging = false;

    function setTarget(x, y) {
      input.x = clamp(x, -1, 1);
      input.y = clamp(y, -1, 1);
      input.last = performance.now();
    }

    // Mouse: normalized across the whole browser window.
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      setTarget((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
    document.addEventListener("mouseleave", () => { input.last = performance.now() - 3000; });

    // Touch drag across the avatar.
    function localNorm(e) {
      const r = tiltEl.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1];
    }
    tiltEl.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      dragging = true;
      try { tiltEl.setPointerCapture(e.pointerId); } catch (_) {}
      requestOrientationPermission();
      setTarget(...localNorm(e));
    });
    tiltEl.addEventListener("pointermove", (e) => {
      if (dragging && e.pointerType !== "mouse") setTarget(...localNorm(e));
    });
    const endDrag = () => { dragging = false; };
    tiltEl.addEventListener("pointerup", endDrag);
    tiltEl.addEventListener("pointercancel", endDrag);

    // Gyroscope tilt on phones/tablets.
    let orientationBound = false, beta0 = null, gamma0 = null;
    function onOrientation(e) {
      if (dragging || e.beta == null || e.gamma == null) return;
      if (beta0 === null) { beta0 = e.beta; gamma0 = e.gamma; }
      setTarget((e.gamma - gamma0) / 25, (e.beta - beta0) / 25);
    }
    function bindOrientation() {
      if (orientationBound) return;
      orientationBound = true;
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
    }
    function requestOrientationPermission() {
      if (!("DeviceOrientationEvent" in window)) return;
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // iOS: must be requested from a user gesture.
        DeviceOrientationEvent.requestPermission().then((s) => { if (s === "granted") bindOrientation(); }).catch(() => {});
      } else {
        bindOrientation();
      }
    }
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) requestOrientationPermission();

    /* ---------------- head tracking ---------------- */
    const frames = new Array(FRAME_COUNT).fill(null);
    let loaded = 0;
    for (let i = 0; i < FRAME_COUNT; i++) {
      loadImage(FRAME_DIR + "frame_" + String(i + 1).padStart(2, "0") + ".jpg")
        .then((img) => { frames[i] = img; loaded++; })
        .catch(() => { if (!loaded && fallback) showFallback(); });
    }
    function showFallback() {
      canvas.hidden = true;
      fallback.hidden = false;
    }

    let frameCur = (FRAME_COUNT - 1) / 2;
    function nearestLoaded(i) {
      for (let d = 0; d < FRAME_COUNT; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    }
    function drawHead() {
      const target = (smooth.x + 1) / 2 * (FRAME_COUNT - 1);
      frameCur += (target - frameCur) * 0.15;
      const lo = clamp(Math.floor(frameCur), 0, FRAME_COUNT - 1);
      const hi = Math.min(lo + 1, FRAME_COUNT - 1);
      const a = nearestLoaded(lo), b = nearestLoaded(hi);
      if (!a) return;
      ctx.globalAlpha = 1;
      ctx.drawImage(a, 0, 0, CSIZE, CSIZE);
      const f = frameCur - lo;
      if (b && b !== a && f > 0.02) { // cross-fade neighbours for a smooth turn
        ctx.globalAlpha = f;
        ctx.drawImage(b, 0, 0, CSIZE, CSIZE);
        ctx.globalAlpha = 1;
      }
    }

    /* ---------------- render loop with visibility gating ---------------- */
    let raf = 0, last = 0, heroVisible = true;

    function frame(now) {
      raf = 0;
      if (!heroVisible || document.hidden) return; // paused; resumed by observers
      const dt = clamp((now - (last || now)) / (1000 / 60), 0.2, 3);
      last = now;

      // gentle idle sway when the user hasn't moved the pointer for a while
      let tx = input.x, ty = input.y;
      if (!isReducedMotion() && !dragging && now - input.last > 4000) {
        tx = Math.sin(now / 1800) * 0.75;
        ty = Math.sin(now / 2600 + 1) * 0.25;
      }
      smooth.x += (tx - smooth.x) * 0.1 * dt;
      smooth.y += (ty - smooth.y) * 0.1 * dt;

      // CSS 3D perspective tilt
      tiltEl.style.transform =
        `perspective(800px) rotateY(${(smooth.x * 15).toFixed(2)}deg) rotateX(${(-smooth.y * 12).toFixed(2)}deg)`;

      drawHead();
      raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (!raf && heroVisible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); }
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } } else kick();
    });

    kick();
  }

  window.initFaceAvatar = initFaceAvatar;

  // Auto-init fallback if avatar markup is already present in DOM
  const tryInit = () => {
    const el = document.getElementById("avatar-3d");
    if (el && !el.dataset.ready) initFaceAvatar(el);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tryInit);
  else tryInit();
})();
