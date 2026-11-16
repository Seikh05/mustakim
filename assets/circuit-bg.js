/* circuit-bg.js — living "silicon web" background on a plain 2D canvas (no WebGL / CDN needed).
 *
 * Components float in 3D (manual perspective projection + rotation) and are wired together with
 * PCB-style octilinear traces (straight run + 45-degree chamfer) whenever they are within range:
 *   - Node types: IC chips (with pins), blinking LEDs, solder pads and vias, plus robotics parts from
 *     the resume projects: quadcopter (ARIES v3), 2-link arm (PID), ROS2 rover with lidar, IMU axes.
 *   - Signal packets (short bit trains) travel along the traces; chips flash and ripple when hit.
 *   - Signal cascade: a click/tap (and an automatic "clock tick" every few seconds) floods a signal
 *     through the web hop by hop, lighting every component in sequence.
 *   - Cursor: a glow follows the pointer; components near it wake up, drift toward it and connect
 *     to it with probe lines.
 *   - Scroll: the web parallaxes, rotates and tilts with scroll position, and surges with speed.
 * Colours are tuned for [data-theme="dark"] and [data-theme="light"]. Pauses when the tab is hidden.
 * prefers-reduced-motion gives a calmer (slower) animation, never a frozen one.
 */
(function () {
  "use strict";

  // OS "reduce motion" setting. A visitor can force full motion with ?motion=full (remembered) or
  // localStorage.motion = "full"; ?motion=reduced clears it.
  const prefersReduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const forceFull = (() => {
    try {
      const m = /[?&]motion=(full|reduced)/.exec(location.search);
      if (m) localStorage.setItem("motion", m[1]);
      return localStorage.getItem("motion") === "full";
    } catch (_) { return false; }
  })();
  const calm = prefersReduce && !forceFull; // still animates, just slower
  const coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const isDark = () => document.documentElement.getAttribute("data-theme") !== "light";

  const PAL = {
    dark: { rgb: "56,189,248", hot: "251,200,64", link: 0.32, node: 0.9, halo: 0.22, packet: 1, chipFill: 0.1, paper: false },
    // light: deeper indigo/blue copper on "blueprint paper" with soft aurora glows, orange signal accent
    light: { rgb: "37,72,205", hot: "234,88,12", link: 0.34, node: 0.92, halo: 0.2, packet: 1, chipFill: 0.1, paper: true, aurora: 0.2 },
  };
  const T_PAD = 0, T_CHIP = 1, T_LED = 2, T_VIA = 3;
  // robotics components taken from the resume projects (types >= T_DRONE)
  const T_DRONE = 4, T_ARM = 5, T_ROVER = 6, T_IMU = 7;
  const LABELS = { [T_DRONE]: "ARIES v3", [T_ARM]: "PID", [T_ROVER]: "ROS2 \u00b7 Nav2", [T_IMU]: "Madgwick" };

  function init() {
    if (document.getElementById("circuit-bg")) return;
    const cv = document.createElement("canvas");
    cv.id = "circuit-bg";
    cv.setAttribute("aria-hidden", "true");
    document.body.prepend(cv);
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    /* ---------------- world ---------------- */
    const N = coarse ? 70 : 150;
    const BX = coarse ? 15 : 21, BY = 14, BZ = 9;
    const TH = coarse ? 4.4 : 4.0, TH2 = TH * TH;      // trace range (world units)
    const CAMZ = 15, PK = coarse ? 16 : 34, MAXL = N * 6;
    const HOP = 0.11;                                  // seconds per hop of the signal cascade
    const rnd = Math.random;

    // how many of each robotics component to scatter through the web
    const ROBO = coarse ? [T_DRONE, T_ARM, T_ROVER, T_IMU]
      : [T_DRONE, T_DRONE, T_DRONE, T_DRONE, T_ARM, T_ARM, T_ARM, T_ROVER, T_ROVER, T_ROVER, T_IMU, T_IMU, T_IMU];
    const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), bv = new Float32Array(N * 3);
    const size = new Float32Array(N), ph = new Float32Array(N), glow = new Float32Array(N), act = new Float32Array(N);
    const ntype = new Uint8Array(N), sx = new Float32Array(N), sy = new Float32Array(N), sk = new Float32Array(N), sd = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rnd() * 2 - 1) * BX; pos[i * 3 + 1] = (rnd() * 2 - 1) * BY; pos[i * 3 + 2] = (rnd() * 2 - 1) * BZ;
      const ax = rnd() < 0.5 ? 0 : 1, s = (0.12 + rnd() * 0.3) * (rnd() < 0.5 ? -1 : 1); // routed-trace style drift
      bv[i * 3 + ax] = s; bv[i * 3 + 2] = (rnd() - 0.5) * 0.08;
      vel[i * 3] = bv[i * 3]; vel[i * 3 + 1] = bv[i * 3 + 1]; vel[i * 3 + 2] = bv[i * 3 + 2];
      const r = rnd();
      if (i < ROBO.length) { ntype[i] = ROBO[i]; size[i] = 0.2 + rnd() * 0.05; ph[i] = rnd() * 6.283; continue; }
      ntype[i] = r < 0.1 ? T_CHIP : r < 0.2 ? T_LED : r < 0.42 ? T_VIA : T_PAD;
      size[i] = ntype[i] === T_CHIP ? 0.12 + rnd() * 0.05 : ntype[i] === T_LED ? 0.055 + rnd() * 0.02 : ntype[i] === T_VIA ? 0.032 + rnd() * 0.012 : 0.048 + rnd() * 0.02;
      ph[i] = rnd() * 6.283;
    }
    const la = new Int16Array(MAXL), lb = new Int16Array(MAXL), lq = new Float32Array(MAXL);
    let linkN = 0;
    const pk = { a: new Int16Array(PK), b: new Int16Array(PK), t: new Float32Array(PK), sp: new Float32Array(PK), hot: new Uint8Array(PK) };

    // signal cascade state
    const cas = { on: false, t: 0, maxD: 0, dist: new Int16Array(N), fired: new Uint8Array(N) };
    let nextAuto = 3 + rnd() * 3;

    /* ---------------- canvas state ---------------- */
    let W = 0, H = 0, dpr = 1, F = 800, pal = PAL.dark, sprites = null;
    let theta = 0, camX = 0, camY = 0;
    let energy = 0, lastScroll = window.scrollY || 0, scrollSm = 0, tilt = 0;
    const mouse = { x: -1, y: -1, sx: -1, sy: -1, on: false };
    const rings = [];
    let pendingClick = null;

    function makeSprites() {
      const mkGlow = (rgb) => {
        const c = document.createElement("canvas"); c.width = c.height = 64;
        const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.3, `rgba(${rgb},0.45)`); gr.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
      };
      sprites = { cool: mkGlow(pal.rgb), hot: mkGlow(pal.hot) };
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
      F = H * 0.96; // focal length in px (matches a 55 degree vertical FOV)
    }
    function applyTheme() { pal = isDark() ? PAL.dark : PAL.light; makeSprites(); }
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    let rto = 0;
    window.addEventListener("resize", () => { clearTimeout(rto); rto = setTimeout(resize, 100); });

    /* ---------------- input ---------------- */
    if (!coarse) {
      window.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        mouse.x = e.clientX; mouse.y = e.clientY;
        if (!mouse.on) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
        mouse.on = true;
      }, { passive: true });
      document.addEventListener("mouseleave", () => { mouse.on = false; });
    }
    window.addEventListener("pointerdown", (e) => { pendingClick = [e.clientX, e.clientY]; }, { passive: true });

    /* ---------------- helpers ---------------- */
    function project() {
      const ct = Math.cos(theta), st = Math.sin(theta);
      for (let i = 0; i < N; i++) {
        const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        const xr = x * ct + z * st, zr = -x * st + z * ct, d = CAMZ - zr;
        sd[i] = d;
        if (d < 1.5) { sk[i] = 0; continue; }
        const k = F / d;
        sk[i] = k;
        sx[i] = W / 2 + (xr - camX) * k;
        sy[i] = H / 2 - (y - camY) * k;
      }
    }
    function screenToWorld(dxPx, dyPx, d, out) {
      const wx = (dxPx * d) / F, wy = -(dyPx * d) / F, ct = Math.cos(theta), st = Math.sin(theta);
      out[0] = wx * ct; out[1] = wy; out[2] = wx * st;
    }
    const tmp3 = [0, 0, 0];
    const wrap = (v, m) => (v > m ? v - 2 * m : v < -m ? v + 2 * m : v);

    // PCB trace between nodes lo->hi (lo < hi): a straight run + a 45-degree chamfer. Writes the knee point.
    const knee = [0, 0];
    function traceKnee(lo, hi) {
      const x1 = sx[lo], y1 = sy[lo], x2 = sx[hi], y2 = sy[hi];
      const dx = x2 - x1, dy = y2 - y1, adx = Math.abs(dx), ady = Math.abs(dy);
      const sxn = dx < 0 ? -1 : 1, syn = dy < 0 ? -1 : 1, diag = Math.min(adx, ady), straight = Math.max(adx, ady) - diag;
      if (((lo + hi) & 1) === 0) { // straight run first, then the chamfer
        if (adx >= ady) { knee[0] = x1 + sxn * straight; knee[1] = y1; } else { knee[0] = x1; knee[1] = y1 + syn * straight; }
      } else { knee[0] = x1 + sxn * diag; knee[1] = y1 + syn * diag; } // chamfer first
    }
    // point at fraction u (0..1, by length) along the trace lo->hi
    function tracePt(lo, hi, u, out) {
      traceKnee(lo, hi);
      const x1 = sx[lo], y1 = sy[lo], x2 = sx[hi], y2 = sy[hi], kx = knee[0], ky = knee[1];
      const L1 = Math.hypot(kx - x1, ky - y1), L2 = Math.hypot(x2 - kx, y2 - ky), d = clamp(u, 0, 1) * (L1 + L2);
      if (d <= L1) { const f = L1 > 0 ? d / L1 : 0; out[0] = x1 + (kx - x1) * f; out[1] = y1 + (ky - y1) * f; }
      else { const f = L2 > 0 ? (d - L1) / L2 : 0; out[0] = kx + (x2 - kx) * f; out[1] = ky + (y2 - ky) * f; }
    }
    const p2 = [0, 0];
    // packet position for a travelling from node a to node b at progress t
    function packetPt(a, b, t, out) { if (a < b) tracePt(a, b, t, out); else tracePt(b, a, 1 - t, out); }

    function respawnPacket(i) {
      if (linkN > 0) { const k = Math.floor(rnd() * linkN); const f = rnd() < 0.5; pk.a[i] = f ? la[k] : lb[k]; pk.b[i] = f ? lb[k] : la[k]; }
      else { pk.a[i] = Math.floor(rnd() * N); pk.b[i] = (pk.a[i] + 1) % N; }
      pk.t[i] = rnd(); pk.sp[i] = 0.45 + rnd() * 0.8; pk.hot[i] = rnd() < 0.25 ? 1 : 0;
    }

    // BFS over the current traces, then fire nodes hop by hop
    function startCascade(src) {
      const dist = cas.dist, head = new Int16Array(N).fill(-1), next = new Int16Array(linkN * 2), to = new Int16Array(linkN * 2);
      let e = 0;
      for (let k = 0; k < linkN; k++) {
        to[e] = lb[k]; next[e] = head[la[k]]; head[la[k]] = e++;
        to[e] = la[k]; next[e] = head[lb[k]]; head[lb[k]] = e++;
      }
      dist.fill(-1); dist[src] = 0;
      const q = [src]; let maxD = 0;
      for (let qi = 0; qi < q.length; qi++) {
        const u = q[qi];
        for (let ed = head[u]; ed !== -1; ed = next[ed]) { const v = to[ed]; if (dist[v] < 0) { dist[v] = dist[u] + 1; maxD = Math.max(maxD, dist[v]); q.push(v); } }
      }
      cas.on = true; cas.t = 0; cas.maxD = maxD; cas.fired.fill(0);
    }
    function nearestVisible(x, y, maxPx) {
      let best = -1, bd = maxPx;
      for (let i = 0; i < N; i++) { if (!sk[i]) continue; const d = Math.hypot(sx[i] - x, sy[i] - y); if (d < bd) { bd = d; best = i; } }
      return best;
    }

    /* ---------------- simulation ---------------- */
    function simulate(t, dt) {
      const speed = calm ? 0.4 : 1 + energy * 3.5;
      const CR = Math.min(260, Math.max(170, W * 0.14));
      const cOn = mouse.on && !coarse;

      if (pendingClick) { // click / tap: ripple + signal cascade from the nearest component
        const [cx, cy] = pendingClick; pendingClick = null;
        rings.push({ x: cx, y: cy, t: 0 }); if (rings.length > 4) rings.shift();
        const src = nearestVisible(cx, cy, 420);
        if (src >= 0 && linkN > 0) startCascade(src);
        energy = Math.min(1.5, energy + 0.25);
      }
      // automatic "clock tick": a cascade from a random chip every few seconds
      nextAuto -= dt;
      if (nextAuto <= 0) {
        nextAuto = 6 + rnd() * 5;
        if (!cas.on && linkN > 0) {
          const chips = []; for (let i = 0; i < N; i++) if (ntype[i] === T_CHIP && sk[i]) chips.push(i);
          if (chips.length) startCascade(chips[Math.floor(rnd() * chips.length)]);
        }
      }
      if (cas.on) {
        cas.t += dt;
        for (let i = 0; i < N; i++) {
          if (cas.dist[i] >= 0 && !cas.fired[i] && cas.t >= cas.dist[i] * HOP) { cas.fired[i] = 1; act[i] = 1; }
        }
        if (cas.t > cas.maxD * HOP + 1.2) cas.on = false;
      }

      const ease = 1 - Math.exp(-dt * 0.9), decay = Math.exp(-dt * 1.7);
      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        let g = 0;
        if (cOn && sk[i]) { // cursor attraction + wake-up
          const dx = mouse.sx - sx[i], dy = mouse.sy - sy[i], d = Math.hypot(dx, dy);
          if (d < CR) {
            const f = 1 - d / CR; g = f;
            screenToWorld(dx / (d + 1), dy / (d + 1), sd[i], tmp3);
            const a = f * f * 22 * dt;
            vel[i3] += tmp3[0] * a * (sd[i] / 15); vel[i3 + 1] += tmp3[1] * a * (sd[i] / 15); vel[i3 + 2] += tmp3[2] * a * 0.3;
            if ((ntype[i] === T_CHIP || ntype[i] >= T_DRONE) && f > 0.55) act[i] = Math.max(act[i], f);
          }
        }
        glow[i] += (g - glow[i]) * Math.min(1, dt * 8);
        act[i] *= decay;
        vel[i3] += (bv[i3] - vel[i3]) * ease; vel[i3 + 1] += (bv[i3 + 1] - vel[i3 + 1]) * ease; vel[i3 + 2] += (bv[i3 + 2] - vel[i3 + 2]) * ease;
        let x = pos[i3] + vel[i3] * dt * speed, y = pos[i3 + 1] + vel[i3 + 1] * dt * speed, z = pos[i3 + 2] + vel[i3 + 2] * dt * speed;
        x = wrap(x, BX); y = wrap(y, BY);
        if (z > BZ || z < -BZ) { vel[i3 + 2] *= -1; bv[i3 + 2] *= -1; z = clamp(z, -BZ, BZ); }
        pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      }

      // traces: connect every pair in range
      let n = 0;
      for (let i = 0; i < N && n < MAXL; i++) {
        for (let j = i + 1; j < N && n < MAXL; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          if (dx > TH || dx < -TH) continue;
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2], d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < TH2) { la[n] = i; lb[n] = j; lq[n] = 1 - Math.sqrt(d2) / TH; n++; }
        }
      }
      linkN = n;

      // packets hop along traces; a chip that receives one flashes
      for (let i = 0; i < PK; i++) {
        let a = pk.a[i], b = pk.b[i];
        const dx = pos[b * 3] - pos[a * 3], dy = pos[b * 3 + 1] - pos[a * 3 + 1], dz = pos[b * 3 + 2] - pos[a * 3 + 2];
        if (a === b || dx * dx + dy * dy + dz * dz > TH2 * 1.3) respawnPacket(i);
        pk.t[i] += pk.sp[i] * dt * speed * (1 + energy * 1.5);
        if (pk.t[i] >= 1) {
          const from = pk.b[i], prev = pk.a[i]; let pick = -1, seen = 0;
          act[from] = Math.max(act[from], (ntype[from] === T_CHIP || ntype[from] >= T_DRONE) ? 1 : 0.55);
          for (let k = 0; k < linkN; k++) {
            const other = la[k] === from ? lb[k] : lb[k] === from ? la[k] : -1;
            if (other >= 0 && other !== prev && rnd() < 1 / ++seen) pick = other;
          }
          if (pick < 0) respawnPacket(i); else { pk.a[i] = from; pk.b[i] = pick; pk.t[i] = 0; }
        }
      }
    }

    function updateCamera(t, dt) {
      const sy0 = window.scrollY || 0, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const prog = clamp(sy0 / max, 0, 1), vS = dt > 0 ? (sy0 - lastScroll) / dt : 0;
      lastScroll = sy0;
      if (dt > 0) energy = Math.min(1.5, energy + (calm ? 0.2 : 1) * Math.min(0.1, Math.abs(vS) / 20000)) * Math.exp(-dt * 1.8);
      scrollSm += (prog - scrollSm) * Math.min(1, dt * 4);
      tilt += (clamp(-vS * 0.00005, -0.1, 0.1) - tilt) * Math.min(1, dt * 5);
      if (mouse.on) { mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 12); mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 12); }
      const mx = coarse || !mouse.on ? 0 : (mouse.sx / W) * 2 - 1, my = coarse || !mouse.on ? 0 : (mouse.sy / H) * 2 - 1;
      theta = scrollSm * 0.9 + Math.sin(t * 0.07) * 0.14 + tilt;
      camX = Math.sin(scrollSm * Math.PI) * 2.4 + mx * 1.1;
      camY = -scrollSm * 6 - my * 0.7;
    }

    /* ---------------- drawing ---------------- */
    const BUCKETS = 5;
    /* ---------------- robotics glyphs ---------------- */
    const rgba = (c, a) => `rgba(${c},${a})`;
    function blob(x, y, hs, a, near, hot) {
      ctx.globalAlpha = a * near; ctx.drawImage(hot ? sprites.hot : sprites.cool, x - hs, y - hs, hs * 2, hs * 2); ctx.globalAlpha = 1;
    }

    // quadcopter, top view: X frame, four counter-rotating rotors, front LED. Rotors spin up when activated.
    function drawDrone(x, y, s, t, col, al, a, i, near) {
      y += Math.sin(t * 1.7 + ph[i]) * s * 0.08;
      const arm = s * 0.95, mr = s * 0.34, spin = t * (16 + a * 34);
      if (a > 0.04) blob(x, y, s * 3, 0.15 + a * 0.45, near, true);
      ctx.strokeStyle = rgba(col, al); ctx.lineWidth = Math.max(1.3, s * 0.13);
      ctx.beginPath(); ctx.moveTo(x - arm, y - arm); ctx.lineTo(x + arm, y + arm); ctx.moveTo(x + arm, y - arm); ctx.lineTo(x - arm, y + arm); ctx.stroke();
      ctx.fillStyle = rgba(col, pal.chipFill + 0.18 + a * 0.3); ctx.fillRect(x - s * 0.3, y - s * 0.3, s * 0.6, s * 0.6);
      ctx.lineWidth = 1.2; ctx.strokeRect(x - s * 0.3, y - s * 0.3, s * 0.6, s * 0.6);
      for (let m = 0; m < 4; m++) {
        const mx = x + (m & 1 ? arm : -arm), my = y + (m & 2 ? arm : -arm), dir = m === 0 || m === 3 ? 1 : -1, ang = spin * dir + m * 1.1;
        ctx.strokeStyle = rgba(col, al * 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.2832); ctx.stroke(); // rotor disc
        ctx.strokeStyle = rgba(col, al * 0.95); ctx.lineWidth = Math.max(1.2, s * 0.1);
        ctx.beginPath(); ctx.moveTo(mx + Math.cos(ang) * mr, my + Math.sin(ang) * mr); ctx.lineTo(mx - Math.cos(ang) * mr, my - Math.sin(ang) * mr); ctx.stroke();
        ctx.fillStyle = rgba(col, al); ctx.beginPath(); ctx.arc(mx, my, Math.max(1, s * 0.07), 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = rgba(pal.hot, al); ctx.beginPath(); ctx.arc(x, y - s * 0.3, Math.max(1.1, s * 0.09), 0, 6.2832); ctx.fill(); // front LED
    }

    // two-link manipulator with a gripper; swings faster when activated
    function drawArm(x, y, s, t, col, al, a, i, near) {
      const sp = 0.7 + a * 2.2, bx = x - s * 0.2, by = y + s * 0.95;
      const a1 = -Math.PI / 2 + 0.55 * Math.sin(t * 0.7 * sp + ph[i]);
      const a2 = a1 + 0.65 + 0.9 * Math.sin(t * 0.9 * sp + ph[i] * 2);
      const L1 = s * 1.5, L2 = s * 1.25;
      const j2x = bx + Math.cos(a1) * L1, j2y = by + Math.sin(a1) * L1, j3x = j2x + Math.cos(a2) * L2, j3y = j2y + Math.sin(a2) * L2;
      if (a > 0.04) blob(j3x, j3y, s * 2.2, 0.15 + a * 0.5, near, true);
      ctx.strokeStyle = rgba(col, al * 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - s * 1.1, by + s * 0.22); ctx.lineTo(bx + s * 1.1, by + s * 0.22); ctx.stroke(); // floor
      ctx.fillStyle = rgba(col, pal.chipFill + 0.15); ctx.fillRect(bx - s * 0.55, by - s * 0.02, s * 1.1, s * 0.24);
      ctx.strokeStyle = rgba(col, al); ctx.lineWidth = 1.2; ctx.strokeRect(bx - s * 0.55, by - s * 0.02, s * 1.1, s * 0.24);
      ctx.lineCap = "round"; ctx.lineWidth = Math.max(2, s * 0.2);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(j2x, j2y); ctx.lineTo(j3x, j3y); ctx.stroke();
      const open = 0.3 + 0.22 * Math.sin(t * 1.4 * sp + ph[i]) + a * 0.3, fl = s * 0.5; // gripper fingers
      ctx.lineWidth = Math.max(1.3, s * 0.1); ctx.beginPath();
      for (const sg of [-1, 1]) { ctx.moveTo(j3x, j3y); ctx.lineTo(j3x + Math.cos(a2 + sg * open) * fl, j3y + Math.sin(a2 + sg * open) * fl); }
      ctx.stroke();
      ctx.fillStyle = rgba(a > 0.04 ? pal.hot : col, al);
      for (const [jx, jy] of [[bx, by], [j2x, j2y], [j3x, j3y]]) { ctx.beginPath(); ctx.arc(jx, jy, Math.max(1.6, s * 0.17), 0, 6.2832); ctx.fill(); }
    }

    // differential-drive rover, top view: wheels with moving treads, rotating lidar sweep, ping ring when active
    function drawRover(x, y, s, t, col, al, a, i, near) {
      const bw = s * 2.2, bh = s * 1.4, ww = s * 1.2, wh = s * 0.36;
      ctx.fillStyle = rgba(col, pal.chipFill + 0.12 + a * 0.25); ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh);
      ctx.strokeStyle = rgba(col, al); ctx.lineWidth = 1.3; ctx.strokeRect(x - bw / 2, y - bh / 2, bw, bh);
      for (const sg of [-1, 1]) {
        const wy = y + sg * (bh / 2 + wh * 0.35) - wh / 2;
        ctx.fillStyle = rgba(col, al * 0.55); ctx.fillRect(x - ww / 2, wy, ww, wh);
        ctx.strokeStyle = rgba(pal.paper ? "255,255,255" : "9,13,22", 0.75); ctx.lineWidth = 1; ctx.beginPath();
        for (let k = 0; k < 3; k++) { const tx = x - ww / 2 + ((t * (0.5 + a) + k / 3) % 1) * ww; ctx.moveTo(tx, wy + 1); ctx.lineTo(tx, wy + wh - 1); }
        ctx.stroke();
      }
      const px = x + s * 0.3, ang = t * (5 + a * 8) + ph[i];
      if (a > 0.04) { ctx.strokeStyle = rgba(pal.hot, a * 0.6 * near); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(px, y, s * (1 + (1 - a) * 3.2), 0, 6.2832); ctx.stroke(); }
      ctx.fillStyle = rgba(col, 0.13 + a * 0.12); ctx.beginPath(); ctx.moveTo(px, y); ctx.arc(px, y, s * 1.9, ang - 0.55, ang); ctx.closePath(); ctx.fill(); // sweep wedge
      ctx.strokeStyle = rgba(a > 0.04 ? pal.hot : col, al); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + Math.cos(ang) * s * 1.9, y + Math.sin(ang) * s * 1.9); ctx.stroke();
      ctx.fillStyle = rgba(col, al); ctx.beginPath(); ctx.arc(px, y, s * 0.3, 0, 6.2832); ctx.fill();
      ctx.fillStyle = rgba(pal.hot, al); ctx.beginPath(); ctx.moveTo(x + bw / 2 + s * 0.35, y); ctx.lineTo(x + bw / 2 - s * 0.05, y - s * 0.3); ctx.lineTo(x + bw / 2 - s * 0.05, y + s * 0.3); ctx.closePath(); ctx.fill(); // heading
    }

    // IMU module with a rotating 3-axis tripod (the attitude estimate)
    const AX_COL = () => [pal.hot, pal.rgb, pal.paper ? "71,85,105" : "148,163,184"];
    function drawImu(x, y, s, t, col, al, a, i, near) {
      const spd = 0.5 + a * 1.5, yaw = t * spd + ph[i], pit = 0.6 * Math.sin(t * 0.4 + ph[i]), rol = 0.5 * Math.sin(t * 0.55 + ph[i] * 2);
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit), cr = Math.cos(rol), sr = Math.sin(rol);
      // R = Rz(yaw) * Ry(pitch) * Rx(roll); columns are the rotated unit axes
      const R = [
        [cy * cp, cy * sp * sr - sy * cr, cy * sp * cr + sy * sr],
        [sy * cp, sy * sp * sr + cy * cr, sy * sp * cr - cy * sr],
      ];
      if (a > 0.04) blob(x, y, s * 2.6, 0.12 + a * 0.45, near, true);
      ctx.fillStyle = rgba(col, pal.chipFill + 0.1); ctx.fillRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 1.1);
      ctx.strokeStyle = rgba(col, al * 0.8); ctx.lineWidth = 1.2; ctx.strokeRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 1.1);
      ctx.beginPath(); ctx.arc(x - s * 0.38, y - s * 0.38, Math.max(1, s * 0.07), 0, 6.2832); ctx.stroke(); // pin-1 mark
      const cols = AX_COL(); ctx.lineWidth = Math.max(1.4, s * 0.13);
      for (let k = 0; k < 3; k++) {
        const ex = x + R[0][k] * s * 1.45, ey = y - R[1][k] * s * 1.45;
        ctx.strokeStyle = rgba(cols[k], al); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = rgba(cols[k], al); ctx.beginPath(); ctx.arc(ex, ey, Math.max(1.2, s * 0.11), 0, 6.2832); ctx.fill();
      }
    }

    function drawRobotic(type, i, t, x, y, r, near, col, al, a) {
      const s = r * 0.95;
      if (type === T_DRONE) drawDrone(x, y, s, t, col, al, a, i, near);
      else if (type === T_ARM) drawArm(x, y, s, t, col, al, a, i, near);
      else if (type === T_ROVER) drawRover(x, y, s, t, col, al, a, i, near);
      else drawImu(x, y, s, t, col, al, a, i, near);
      if (s > 9 && near > 0.55) { // tiny caption tying the part to the resume
        ctx.font = "600 9px ui-monospace, Menlo, Consolas, monospace"; ctx.textAlign = "center";
        ctx.fillStyle = rgba(col, 0.5 * near); ctx.fillText(LABELS[type], x, y + s * 2.35); ctx.textAlign = "start";
      }
    }

    function drawNode(i, t) {
      const near = clamp(1.25 - sd[i] / 26, 0.3, 1), a = act[i], gl = glow[i], on = a > 0.05 || gl > 0.05;
      const tw = 0.85 + 0.15 * Math.sin(t * 1.6 + ph[i]);
      const r = Math.max(1.4, size[i] * sk[i] * tw * (1 + gl * 0.8 + energy * 0.3 + a * 0.35));
      const col = on ? pal.hot : pal.rgb, al = pal.node * near;
      const x = sx[i], y = sy[i];

      if (a > 0.04) { // activation ripple
        ctx.strokeStyle = `rgba(${pal.hot},${a * 0.55 * near})`; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(x, y, r * (1.8 + (1 - a) * 7), 0, 6.2832); ctx.stroke();
      }
      const type = ntype[i];
      if (type >= T_DRONE) { drawRobotic(type, i, t, x, y, r, near, col, al, a); return; }
      if (type === T_CHIP) {
        const s = r * 2.3, pinsOn = s > 8;
        if (a > 0.04 || gl > 0.05) { const hs = s * 2.6; ctx.globalAlpha = (0.2 + Math.max(a, gl) * 0.5) * near; ctx.drawImage(sprites.hot, x - hs, y - hs, hs * 2, hs * 2); ctx.globalAlpha = 1; }
        ctx.fillStyle = `rgba(${col},${pal.chipFill + a * 0.35})`; ctx.fillRect(x - s / 2, y - s / 2, s, s);
        ctx.strokeStyle = `rgba(${col},${al})`; ctx.lineWidth = 1.2; ctx.strokeRect(x - s / 2, y - s / 2, s, s);
        if (pinsOn) {
          ctx.beginPath();
          for (let k = -1; k <= 1; k++) {
            const o = k * s * 0.28;
            ctx.moveTo(x + o, y - s / 2); ctx.lineTo(x + o, y - s / 2 - s * 0.22); ctx.moveTo(x + o, y + s / 2); ctx.lineTo(x + o, y + s / 2 + s * 0.22);
            ctx.moveTo(x - s / 2, y + o); ctx.lineTo(x - s / 2 - s * 0.22, y + o); ctx.moveTo(x + s / 2, y + o); ctx.lineTo(x + s / 2 + s * 0.22, y + o);
          }
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${col},${(0.35 + 0.65 * Math.max(a, 0.5 + 0.5 * Math.sin(t * 2 + ph[i]))) * al})`;
        const d = s * 0.22; ctx.fillRect(x - d, y - d, d * 2, d * 2); // die
      } else if (type === T_LED) {
        const blink = Math.max(a, Math.pow(Math.max(0, Math.sin(t * (0.9 + (ph[i] % 1)) + ph[i])), 6));
        const hs = r * (3 + blink * 4);
        ctx.globalAlpha = (0.15 + blink * 0.7) * near; ctx.drawImage(blink > 0.4 ? sprites.hot : sprites.cool, x - hs, y - hs, hs * 2, hs * 2); ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${blink > 0.4 ? pal.hot : pal.rgb},${(0.45 + blink * 0.55) * near})`;
        ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, 6.2832); ctx.fill();
      } else if (type === T_VIA) {
        ctx.fillStyle = `rgba(${col},${al * 0.85})`; ctx.beginPath(); ctx.arc(x, y, r * 0.75, 0, 6.2832); ctx.fill();
      } else { // solder pad: ring + centre
        ctx.strokeStyle = `rgba(${col},${al})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = `rgba(${col},${al})`; ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, 6.2832); ctx.fill();
        if (on) { const hs = r * 4; ctx.globalAlpha = (0.2 + Math.max(a, gl) * 0.5) * near; ctx.drawImage(sprites.hot, x - hs, y - hs, hs * 2, hs * 2); ctx.globalAlpha = 1; }
      }
    }

    // Light mode "blueprint paper": drifting pastel glows + a faint parallax grid behind the web.
    const AURORA = [[0.14, 0.18, "99,102,241", 0.9], [0.88, 0.3, "56,189,248", 0.8], [0.55, 0.92, "251,146,60", 0.55], [0.3, 0.62, "45,212,191", 0.4]];
    function drawPaper(t) {
      const R = Math.max(W, H) * 0.62;
      for (let i = 0; i < AURORA.length; i++) {
        const b = AURORA[i];
        const cx = W * (b[0] + 0.07 * Math.sin(t * 0.045 + i * 2.1)) - camX * 14;
        const cy = H * (b[1] + 0.06 * Math.cos(t * 0.037 + i * 1.7)) - scrollSm * H * 0.25 * (i % 2 ? 1 : 0.5);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.8 + 0.25 * b[3]));
        g.addColorStop(0, `rgba(${b[2]},${pal.aurora * b[3]})`); g.addColorStop(1, `rgba(${b[2]},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      const GS = 44, ox = (-camX * 18 + 4000 * GS) % GS, oy = (camY * 18 + 4000 * GS) % GS;
      ctx.lineWidth = 1;
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass ? "rgba(37,72,205,0.075)" : "rgba(37,72,205,0.04)";
        ctx.beginPath();
        for (let x = ox - GS; x < W + GS; x += GS) { const major = Math.round((x - ox) / GS) % 5 === 0; if ((pass === 1) === major) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } }
        for (let y = oy - GS; y < H + GS; y += GS) { const major = Math.round((y - oy) / GS) % 5 === 0; if ((pass === 1) === major) { ctx.moveTo(0, y); ctx.lineTo(W, y); } }
        ctx.stroke();
      }
    }

    function drawFrame(t, dt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      project();
      if (pal.paper) drawPaper(t);
      const boost = 1 + Math.min(1, energy) * 1.1;
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      // traces, bucketed by strength so each bucket is a single stroked path
      for (let b = 0; b < BUCKETS; b++) {
        const lo = b / BUCKETS, hi = (b + 1) / BUCKETS;
        ctx.beginPath();
        let any = false;
        for (let k = 0; k < linkN; k++) {
          const a = la[k], c = lb[k], q = lq[k];
          if (q < lo || q >= hi + (b === BUCKETS - 1 ? 1 : 0) || !sk[a] || !sk[c]) continue;
          traceKnee(a, c);
          ctx.moveTo(sx[a], sy[a]); ctx.lineTo(knee[0], knee[1]); ctx.lineTo(sx[c], sy[c]); any = true;
        }
        if (!any) continue;
        ctx.strokeStyle = `rgba(${pal.rgb},${Math.min(1, pal.link * ((b + 0.7) / BUCKETS) * boost)})`;
        ctx.lineWidth = 1 + (b / BUCKETS) * 0.5;
        ctx.stroke();
      }
      // traces carrying a signal light up (cascade / packet arrival)
      ctx.lineWidth = 1.8;
      for (let k = 0; k < linkN; k++) {
        const a = la[k], c = lb[k], ga = Math.max(act[a], act[c]);
        if (ga < 0.08 || !sk[a] || !sk[c]) continue;
        traceKnee(a, c);
        ctx.strokeStyle = `rgba(${pal.hot},${Math.min(0.85, ga * 0.85)})`;
        ctx.beginPath(); ctx.moveTo(sx[a], sy[a]); ctx.lineTo(knee[0], knee[1]); ctx.lineTo(sx[c], sy[c]); ctx.stroke();
      }

      // cursor halo + probe lines to nearby components
      if (mouse.on && !coarse) {
        const CR = Math.min(260, Math.max(170, W * 0.14));
        const gl = ctx.createRadialGradient(mouse.sx, mouse.sy, 0, mouse.sx, mouse.sy, CR * 0.9);
        gl.addColorStop(0, `rgba(${pal.rgb},${pal.halo})`); gl.addColorStop(1, `rgba(${pal.rgb},0)`);
        ctx.fillStyle = gl; ctx.fillRect(mouse.sx - CR, mouse.sy - CR, CR * 2, CR * 2);
        ctx.lineWidth = 1.1;
        for (let i = 0; i < N; i++) {
          if (!sk[i]) continue;
          const d = Math.hypot(sx[i] - mouse.sx, sy[i] - mouse.sy);
          if (d < CR) {
            ctx.strokeStyle = `rgba(${pal.hot},${(1 - d / CR) * 0.65})`;
            ctx.beginPath(); ctx.moveTo(mouse.sx, mouse.sy); ctx.lineTo(sx[i], sy[i]); ctx.stroke();
          }
        }
      }

      for (let i = 0; i < N; i++) if (sk[i]) drawNode(i, t);

      // packets: a short train of bits (head + two trailing squares) running along the traces
      for (let i = 0; i < PK; i++) {
        const a = pk.a[i], b = pk.b[i];
        if (!sk[a] || !sk[b]) continue;
        const f = clamp(pk.t[i], 0, 1), k = (sk[a] + sk[b]) / 2, r = clamp(0.1 * k, 2, 6.5) * (1 + energy * 0.5);
        const rgb = pk.hot[i] ? pal.hot : pal.rgb, spr = pk.hot[i] ? sprites.hot : sprites.cool;
        for (let s = 2; s >= 1; s--) { // trailing bits (alternate 1 / 0 look)
          const fu = f - s * 0.06; if (fu < 0) continue;
          packetPt(a, b, fu, p2);
          ctx.fillStyle = `rgba(${rgb},${(s === 1 ? 0.6 : 0.35) * pal.packet})`;
          const q = r * (s === 1 ? 0.7 : 0.55); ctx.fillRect(p2[0] - q, p2[1] - q, q * 2, q * 2);
        }
        packetPt(a, b, f, p2);
        const hs = r * 4.2; ctx.globalAlpha = 0.95 * pal.packet; ctx.drawImage(spr, p2[0] - hs / 2, p2[1] - hs / 2, hs, hs); ctx.globalAlpha = 1;
        if (pal.paper) { // dark core so the packet pops on white
          ctx.fillStyle = pk.hot[i] ? "rgba(154,52,18,0.95)" : "rgba(23,37,110,0.95)";
          ctx.beginPath(); ctx.arc(p2[0], p2[1], Math.max(1.3, r * 0.5), 0, 6.2832); ctx.fill();
        }
      }

      // click ripples
      for (let i = rings.length - 1; i >= 0; i--) {
        const s = rings[i]; s.t += dt * 0.9;
        if (s.t >= 1) { rings.splice(i, 1); continue; }
        const e = 1 - Math.pow(1 - s.t, 2.2);
        ctx.strokeStyle = `rgba(${pal.hot},${(1 - s.t) * 0.6})`; ctx.lineWidth = 2 * (1 - s.t) + 0.5;
        ctx.beginPath(); ctx.arc(s.x, s.y, 20 + e * Math.max(W, H) * 0.3, 0, 6.2832); ctx.stroke();
      }
    }

    /* ---------------- loop ---------------- */
    let raf = 0, last = 0;
    function loop(now) {
      raf = 0;
      if (document.hidden) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      const t = now / 1000;
      updateCamera(t, dt);
      simulate(t, dt);
      drawFrame(t, dt);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } } else start();
    });

    applyTheme();
    resize();
    updateCamera(0, 0.016); project(); simulate(0, 0.016);   // build links once, then seed packets on them
    for (let i = 0; i < PK; i++) respawnPacket(i);
    start();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
