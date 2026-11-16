/* three-scene.js — 3D engineering showcase.
 *
 *  1. Hero stage  (#hero-3d-stage): digital-logic pipeline  <->  robot lidar mapping + A*  <->  attitude gimbal
 *     (all illustrative simulations).
 *
 * Both share one requestAnimationFrame loop that pauses when the hero is off-screen
 * (IntersectionObserver) or the tab is hidden (visibilitychange).
 * Entry point: window.initThreeScene(stageEl). (The page background lives in circuit-bg.js.)
 */
(function () {
  "use strict";

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
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
  const reduceMotion = prefersReduce && !forceFull;
  const touchMode = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  const isDark = () => document.documentElement.getAttribute("data-theme") !== "light";

  const hasWebGL = (() => {
    try { return !!window.THREE && !!document.createElement("canvas").getContext("webgl"); }
    catch (_) { return false; }
  })();

  /* ---------------- shared loop ---------------- */
  const items = [];
  let raf = 0, lastT = 0;
  function tick(now) {
    raf = 0;
    if (document.visibilityState === "hidden") return;
    const dt = clamp((now - (lastT || now)) / 1000, 0.001, 0.05);
    lastT = now;
    let any = false;
    for (const it of items) if (it.active()) { it.frame(now / 1000, dt); any = true; }
    if (any) raf = requestAnimationFrame(tick);
  }
  function kick() {
    if (!raf && document.visibilityState !== "hidden") { lastT = 0; raf = requestAnimationFrame(tick); }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else kick();
  });

  // Palette per theme
  function palette() {
    return isDark()
      ? { accent: 0x38bdf8, accentV: [0.22, 0.74, 0.97], ambient: 0.35, key: 1.1, cyanL: 1.3, goldL: 0.8,
          envBg: 0x070b14, envPanel: 2.4 }
      : { accent: 0x2563eb, accentV: [0.15, 0.39, 0.92], ambient: 0.75, key: 0.95, cyanL: 0.7, goldL: 0.5,
          envBg: 0xe6edf8, envPanel: 3.2 };
  }
  function onThemeChange(fn) {
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* =====================================================================
     HERO STAGE — three illustrative simulations on a dark "scope" panel
       logic   : clocked 10-stage pipelined datapath (registers, gates, data tokens, waveform)
       robot   : differential-drive robot with 2D lidar occupancy mapping + A* planning
       gimbal  : 3-axis attitude gimbal fed by a simulated IMU stream
     ===================================================================== */
  function initThreeScene(stage) {
    if (!stage || stage.dataset.ready) return;
    stage.dataset.ready = "1";
    if (!hasWebGL) { stage.hidden = true; return; }

    const host = stage.querySelector(".stage-canvas-host");
    const pills = stage.querySelectorAll("[data-scene]");
    const caption = stage.querySelector(".stage-caption");
    const q = (sel) => stage.querySelector(sel);
    const hudEls = {
      pitch: q("[data-hud=pitch]"), roll: q("[data-hud=roll]"), yaw: q("[data-hud=yaw]"),
      map: q("[data-hud=map]"), goal: q("[data-hud=goal]"), speed: q("[data-hud=speed]"),
      clk: q("[data-hud=clk]"),
    };
    const waveCanvas = q(".stage-wave");
    const CAPTIONS = {
      logic: "Illustrative simulation · 10-stage pipelined datapath · drag to rotate",
      robot: "Illustrative simulation · lidar occupancy grid + A* planner · drag to rotate",
      gimbal: "ARIES v3 · Madgwick IMU fusion · simulated attitude stream",
    };
    const ACCENT = 0x38bdf8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchMode ? 1.5 : 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 2, 0.1, 60);
    camera.position.set(0, 3.1, 5.6);
    camera.lookAt(0, -0.05, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    const key = new THREE.DirectionalLight(0xbfd9ff, 1.0);
    key.position.set(3, 5, 4);
    const cyanL = new THREE.PointLight(ACCENT, 1.2, 14); cyanL.position.set(-3, 2, 3);
    const goldL = new THREE.PointLight(0xffb454, 0.7, 14); goldL.position.set(3, 1.5, -2);
    scene.add(ambient, key, cyanL, goldL);

    // fixed dark studio environment for the metallic gimbal rings
    {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const es = new THREE.Scene();
      es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), new THREE.MeshBasicMaterial({ color: 0x070b14, side: THREE.BackSide })));
      const panel = (col, mult, pos, w, h) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(mult), side: THREE.DoubleSide }));
        m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); es.add(m);
      };
      panel(0xffffff, 2.4, [5, 6, 3], 7, 3); panel(ACCENT, 2.2, [-6, 2, -2], 3, 6);
      panel(0xffc27a, 1.2, [3, -2, 6], 5, 2); panel(0xffffff, 1.4, [0, 9, -1], 6, 6);
      const rt = pmrem.fromScene(es, 0.03);
      scene.environment = rt.texture;
      pmrem.dispose();
      es.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }

    const rig = new THREE.Group();   // pointer parallax / drag / idle sway
    scene.add(rig);
    const SCENES = ["logic", "robot", "gimbal"];
    const groups = {};
    SCENES.forEach((n) => { groups[n] = new THREE.Group(); rig.add(groups[n]); });
    const NEED_W = { logic: 6.9, robot: 5.7, gimbal: 4.4 }; // world width each scene needs on screen
    const fit = { logic: 1, robot: 1, gimbal: 1 };

    const tmpColor = new THREE.Color();
    const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

    /* ============================================================
       SCENE 1 — digital logic: clocked 10-stage pipeline
       ============================================================ */
    const logic = groups.logic;
    const STAGES = 10, SP = 0.6, X0 = -((STAGES - 1) * SP) / 2, BITS = 8;
    const stageX = (s) => X0 + s * SP;

    logic.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.05, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x0b1424, metalness: 0.3, roughness: 0.65 })), {}));
    {
      const g = new THREE.GridHelper(6.6, 33, ACCENT, ACCENT);
      g.scale.z = 2.1 / 6.6; g.position.y = 0.027;
      g.material.transparent = true; g.material.opacity = 0.07; g.material.depthWrite = false;
      logic.add(g);
    }

    // register banks
    const regGeo = new THREE.BoxGeometry(0.34, 0.14, 1.05);
    const regMat = new THREE.MeshStandardMaterial({ color: 0x101b30, metalness: 0.6, roughness: 0.35 });
    const regs = new THREE.InstancedMesh(regGeo, regMat, STAGES);
    {
      const m4 = new THREE.Matrix4();
      for (let s = 0; s < STAGES; s++) { m4.setPosition(stageX(s), 0.095, 0); regs.setMatrixAt(s, m4); }
    }
    logic.add(regs);

    // 8 bit-cells on top of every register
    const cells = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }), STAGES * BITS);
    {
      const m4 = new THREE.Matrix4(), c = new THREE.Color(0x0c1a2c);
      for (let s = 0; s < STAGES; s++) for (let b = 0; b < BITS; b++) {
        m4.setPosition(stageX(s), 0.175, -0.42 + b * 0.12);
        cells.setMatrixAt(s * BITS + b, m4); cells.setColorAt(s * BITS + b, c);
      }
    }
    logic.add(cells);

    // data lanes between stages (pulsing ribbons along X) — shared pulse shader
    const lanePos = [], laneU = [], laneR = [], laneIdx = [];
    for (let l = 0; l < BITS; l++) {
      const z = -0.42 + l * 0.12, x0 = -3.05, x1 = 3.05, w = 0.011, base = lanePos.length / 3, rr = (l * 0.137) % 1;
      lanePos.push(x0, 0.056, z - w, x0, 0.056, z + w, x1, 0.056, z - w, x1, 0.056, z + w);
      laneU.push(0, 0, 1, 1); laneR.push(rr, rr, rr, rr);
      laneIdx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
    const laneGeo = new THREE.BufferGeometry();
    laneGeo.setAttribute("position", new THREE.Float32BufferAttribute(lanePos, 3));
    laneGeo.setAttribute("aU", new THREE.Float32BufferAttribute(laneU, 1));
    laneGeo.setAttribute("aR", new THREE.Float32BufferAttribute(laneR, 1));
    laneGeo.setIndex(laneIdx);
    const laneMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Vector3(0.22, 0.74, 0.97) } },
      vertexShader: "attribute float aU; attribute float aR; varying float vU; varying float vR;\n" +
        "void main(){ vU=aU; vR=aR; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform float uTime; uniform vec3 uColor; varying float vU; varying float vR;\n" +
        "void main(){ float p=fract(vU*3.0 - uTime*(0.5+0.5*vR) + vR*7.0);\n" +
        " float pulse=smoothstep(0.0,0.05,p)*(1.0-smoothstep(0.05,0.22,p));\n" +
        " gl_FragColor=vec4(uColor*(0.22+1.6*pulse),1.0); }",
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    logic.add(new THREE.Mesh(laneGeo, laneMat));

    // logic gates in the gaps between registers (AND "D" shapes / NOT triangles)
    const gates = [];
    {
      const andS = new THREE.Shape();
      andS.moveTo(-0.075, -0.06); andS.lineTo(0, -0.06); andS.absarc(0, 0, 0.06, -Math.PI / 2, Math.PI / 2, false); andS.lineTo(-0.075, 0.06); andS.closePath();
      const notS = new THREE.Shape();
      notS.moveTo(-0.07, -0.06); notS.lineTo(0.07, 0); notS.lineTo(-0.07, 0.06); notS.closePath();
      const geoA = new THREE.ExtrudeGeometry(andS, { depth: 0.03, bevelEnabled: false }); geoA.rotateX(-Math.PI / 2);
      const geoN = new THREE.ExtrudeGeometry(notS, { depth: 0.03, bevelEnabled: false }); geoN.rotateX(-Math.PI / 2);
      const edgeMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 });
      for (let s = 0; s < STAGES - 1; s++) {
        const geo = s % 2 ? geoN : geoA;
        const mat = new THREE.MeshStandardMaterial({ color: 0x0e2236, emissive: ACCENT, emissiveIntensity: 0.15, metalness: 0.5, roughness: 0.4 });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(stageX(s) + SP / 2, 0.07, ((s % 4) - 1.5) * 0.24);
        m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
        logic.add(m); gates.push(m);
      }
    }

    // stage labels printed on the board
    {
      const c = document.createElement("canvas"); c.width = 1320; c.height = 64;
      const g = c.getContext("2d");
      g.fillStyle = "#5fbfe8"; g.font = "700 26px ui-monospace, Menlo, Consolas, monospace"; g.textAlign = "center"; g.textBaseline = "middle";
      for (let s = 0; s < STAGES; s++) g.fillText("S" + (s + 1), (stageX(s) + 3.3) * 200, 32);
      g.fillStyle = "#4ade80"; g.fillText("IN", 0.25 * 200, 32); g.fillText("OUT", 6.35 * 200, 32);
      const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 0.32), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.8 }));
      lab.rotation.x = -Math.PI / 2; lab.position.set(0, 0.03, 0.86);
      logic.add(lab);
    }

    // clock source LED + expanding clock-edge ripple
    const clkLed = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), new THREE.MeshBasicMaterial({ color: 0x1a3a52 }));
    clkLed.position.set(-3.1, 0.07, -0.86);
    const outLed = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), new THREE.MeshBasicMaterial({ color: 0x14321f }));
    outLed.position.set(3.1, 0.07, -0.86);
    logic.add(clkLed, outLed);
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.11, 64),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    ripple.rotation.x = -Math.PI / 2; ripple.position.set(-3.1, 0.065, -0.86);
    logic.add(ripple);

    // data tokens hopping stage-to-stage on every clock edge
    const TOK_N = 8;
    const tokMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: 0xffffff }), TOK_N);
    tokMesh.frustumCulled = false;
    logic.add(tokMesh);
    const tokens = []; // { stage, value, hue }
    const stageTok = new Array(STAGES).fill(null);
    const hash8 = (k) => { let h = (k * 2654435761) >>> 0; h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; return (h ^ (h >>> 16)) & 255; };
    const T_CLK = reduceMotion ? 1.6 : 0.9;
    let tickIdx = -1, tickT = 0, flashOut = 0;
    function logicTick() {
      tickIdx++;
      for (let i = tokens.length - 1; i >= 0; i--) { // advance & transform (x ^= x<<1)
        const tk = tokens[i];
        stageTok[tk.stage] = null;
        tk.prev = tk.stage;
        tk.stage++;
        tk.value = (tk.value ^ (tk.value << 1)) & 255;
        if (tk.stage >= STAGES) { tokens.splice(i, 1); flashOut = 1; continue; }
      }
      if (tickIdx % 2 === 0 && tokens.length < TOK_N) { // 2-deep frame pipelining: new frame every 2nd edge
        tokens.push({ stage: 0, prev: -1, value: hash8(tickIdx), hue: (tickIdx * 0.137) % 1 });
      }
      for (const tk of tokens) {
        stageTok[tk.stage] = tk;
        if (tk.stage > 0 && gates[tk.stage - 1]) gates[tk.stage - 1].material.emissiveIntensity = 1.6;
      }
      ripple.userData.t = 0;
    }
    function updateLogic(t, dt) {
      tickT += dt;
      while (tickT >= T_CLK) { tickT -= T_CLK; logicTick(); }
      const phase = tickT / T_CLK, mv = clamp(phase / 0.4, 0, 1), ease = mv * mv * (3 - 2 * mv);

      // clock LED + ripple
      const edge = Math.max(0, 1 - phase / 0.25);
      clkLed.material.color.setRGB(0.1 + 0.2 * edge, 0.23 + 0.5 * edge, 0.32 + 0.65 * edge);
      const rp = (ripple.userData.t = (ripple.userData.t === undefined ? 1 : ripple.userData.t) + dt * 0.9);
      ripple.scale.setScalar(1 + rp * 22);
      ripple.material.opacity = Math.max(0, 0.5 * (1 - rp * 1.1));
      flashOut = Math.max(0, flashOut - dt * 2.5);
      outLed.material.color.setRGB(0.08 + 0.1 * flashOut, 0.2 + 0.75 * flashOut, 0.12 + 0.3 * flashOut);

      // tokens
      const m4 = new THREE.Matrix4(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), qI = new THREE.Quaternion();
      for (let i = 0; i < TOK_N; i++) {
        const tk = tokens[i];
        if (!tk) { sc.setScalar(0.0001); m4.compose(pos.set(0, -5, 0), qI, sc); tokMesh.setMatrixAt(i, m4); continue; }
        const from = tk.prev < 0 ? tk.stage - 0.7 : tk.prev;
        const sPos = from + (tk.stage - from) * ease;
        pos.set(stageX(0) + sPos * SP, 0.36 + Math.sin(t * 3 + i) * 0.02, 0);
        sc.setScalar(1);
        m4.compose(pos, qI, sc); tokMesh.setMatrixAt(i, m4);
        tokMesh.setColorAt(i, tmpColor.setHSL(tk.hue, 0.85, 0.6));
      }
      tokMesh.instanceMatrix.needsUpdate = true;
      if (tokMesh.instanceColor) tokMesh.instanceColor.needsUpdate = true;

      // register bit-cells show the byte currently held in each stage
      for (let s = 0; s < STAGES; s++) {
        const tk = stageTok[s];
        for (let b = 0; b < BITS; b++) {
          const on = tk && ((tk.value >> b) & 1);
          if (on) tmpColor.setHSL(tk.hue, 0.9, 0.58);
          else tmpColor.setRGB(0.05, 0.1, 0.17);
          cells.setColorAt(s * BITS + b, tmpColor);
        }
      }
      cells.instanceColor.needsUpdate = true;
      for (const g of gates) g.material.emissiveIntensity += (0.15 - g.material.emissiveIntensity) * (1 - Math.exp(-dt * 5));

      laneMat.uniforms.uTime.value = t;
      if (hudEls.clk) hudEls.clk.textContent = (1 / T_CLK).toFixed(2) + " Hz";
      drawWave(t);
    }

    // CLK / VALID / D[7:0] waveform strip (2D canvas overlay)
    const wctx = waveCanvas ? waveCanvas.getContext("2d") : null;
    function drawWave(t) {
      if (!wctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), W = 190, H = 58;
      if (waveCanvas.width !== W * dpr) { waveCanvas.width = W * dpr; waveCanvas.height = H * dpr; }
      wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wctx.clearRect(0, 0, W, H);
      const PPS = 46, rows = [10, 29, 48]; // px per second, row baselines
      wctx.font = "600 8px ui-monospace, Menlo, Consolas, monospace";
      wctx.lineWidth = 1.2; wctx.strokeStyle = "#38bdf8"; wctx.fillStyle = "#7dd3fc";
      const tAt = (x) => t - (W - 24 - x) / PPS; // right edge 24px is "now"
      const nowK = tickIdx + tickT / T_CLK;
      const kAt = (x) => nowK - (W - 24 - x) / PPS / T_CLK;
      wctx.beginPath();
      for (let x = 22; x <= W - 24; x++) { // CLK
        const k = kAt(x), y = (k - Math.floor(k)) < 0.5 ? rows[0] - 6 : rows[0] + 2;
        x === 22 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
      }
      wctx.stroke();
      wctx.strokeStyle = "#4ade80"; wctx.beginPath(); // VALID: high on injection edges (every 2nd)
      for (let x = 22; x <= W - 24; x++) {
        const k = Math.floor(kAt(x)), y = k % 2 === 0 ? rows[1] - 6 : rows[1] + 2;
        x === 22 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
      }
      wctx.stroke();
      // D[7:0] bus as boxed hex words changing on clock edges
      wctx.strokeStyle = "#f5b942"; wctx.fillStyle = "#fcd34d";
      const k0 = Math.floor(kAt(22)), k1 = Math.floor(nowK);
      for (let k = k0; k <= k1; k++) {
        const xs = Math.max(22, 22 + (k - kAt(22)) * T_CLK * PPS), xe = Math.min(W - 24, 22 + (k + 1 - kAt(22)) * T_CLK * PPS);
        if (xe - xs < 3) continue;
        const valid = k % 2 === 0;
        wctx.globalAlpha = valid ? 1 : 0.35;
        wctx.strokeRect(xs + 1, rows[2] - 6, xe - xs - 2, 8);
        if (valid && xe - xs > 18) wctx.fillText(hash8(k).toString(16).toUpperCase().padStart(2, "0"), xs + (xe - xs) / 2 - 6, rows[2] + 1.5);
      }
      wctx.globalAlpha = 1;
      wctx.fillStyle = "#94a3b8"; wctx.fillText("CLK", 0, rows[0] + 1); wctx.fillText("VLD", 0, rows[1] + 1); wctx.fillText("D", 5, rows[2] + 1.5);
      wctx.strokeStyle = "rgba(148,163,184,.5)"; wctx.beginPath(); wctx.moveTo(W - 24, 0); wctx.lineTo(W - 24, H); wctx.stroke();
    }

    /* ============================================================
       SCENE 2 — robotics: lidar occupancy mapping + A* path planning
       ============================================================ */
    const robotG = groups.robot;
    const GW = 26, GH = 16, CS = 0.2;
    const gx = (i) => (i - GW / 2 + 0.5) * CS, gz = (j) => (j - GH / 2 + 0.5) * CS;
    const cellOf = (x, z) => [Math.floor(x / CS + GW / 2), Math.floor(z / CS + GH / 2)];
    const idxOf = (i, j) => j * GW + i;
    const occ = new Uint8Array(GW * GH), known = new Uint8Array(GW * GH);
    [[5, 3, 2, 5], [10, 9, 5, 2], [14, 2, 2, 4], [19, 8, 2, 6], [7, 12, 3, 2], [21, 2, 3, 2], [2, 8, 3, 1]]
      .forEach(([i0, j0, w, h]) => { for (let j = j0; j < j0 + h; j++) for (let i = i0; i < i0 + w; i++) occ[idxOf(i, j)] = 1; });
    const blocked = new Uint8Array(GW * GH); // obstacles inflated by one cell for the planner
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      if (!occ[idxOf(i, j)]) continue;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const a = i + di, b = j + dj;
        if (a >= 0 && b >= 0 && a < GW && b < GH) blocked[idxOf(a, b)] = 1;
      }
    }

    robotG.add(new THREE.Mesh(new THREE.BoxGeometry(GW * CS, 0.04, GH * CS), new THREE.MeshStandardMaterial({ color: 0x0a1322, metalness: 0.2, roughness: 0.7 })));
    {
      const wm = new THREE.MeshStandardMaterial({ color: 0x16253d, metalness: 0.5, roughness: 0.4 });
      const wall = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), wm); m.position.set(x, 0.07, z); robotG.add(m); };
      const AW = GW * CS, AH = GH * CS;
      wall(AW + 0.08, 0.04, 0, -AH / 2 - 0.02); wall(AW + 0.08, 0.04, 0, AH / 2 + 0.02);
      wall(0.04, AH, -AW / 2 - 0.02, 0); wall(0.04, AH, AW / 2 + 0.02, 0);
    }
    // obstacle boxes + discoverable top caps; free-space cells
    const occList = []; for (let n = 0; n < occ.length; n++) if (occ[n]) occList.push(n);
    const capOf = new Int16Array(GW * GH).fill(-1);
    const obsMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(CS * 0.94, 0.2, CS * 0.94),
      new THREE.MeshStandardMaterial({ color: 0x14233a, metalness: 0.5, roughness: 0.45 }), occList.length);
    const capMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(CS * 0.86, CS * 0.86).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), occList.length);
    {
      const m4 = new THREE.Matrix4(), m5 = new THREE.Matrix4(), black = new THREE.Color(0, 0, 0);
      occList.forEach((n, k) => {
        const i = n % GW, j = Math.floor(n / GW);
        m4.setPosition(gx(i), 0.12, gz(j)); obsMesh.setMatrixAt(k, m4);
        m5.setPosition(gx(i), 0.222, gz(j)); capMesh.setMatrixAt(k, m5);
        capMesh.setColorAt(k, black); capOf[n] = k;
      });
    }
    robotG.add(obsMesh, capMesh);
    const freeMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(CS * 0.9, CS * 0.9).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), GW * GH);
    {
      const m4 = new THREE.Matrix4(), black = new THREE.Color(0, 0, 0);
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { m4.setPosition(gx(i), 0.026, gz(j)); freeMesh.setMatrixAt(idxOf(i, j), m4); freeMesh.setColorAt(idxOf(i, j), black); }
    }
    robotG.add(freeMesh);
    const cellLevel = new Float32Array(GW * GH); // fade-in level of discovered cells
    let mapDirty = false, knownCount = 0, freeTotal = 0;
    for (let n = 0; n < occ.length; n++) if (!occ[n]) freeTotal++;

    // the robot: differential drive, caster, spinning lidar puck
    const bot = new THREE.Group();
    robotG.add(bot);
    {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 28), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.5, roughness: 0.35 }));
      body.position.y = 0.09;
      const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 28), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.4 }));
      deck.position.y = 0.131;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      nose.rotation.z = -Math.PI / 2; nose.position.set(0.15, 0.09, 0);
      bot.add(body, deck, nose);
    }
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.7 });
    const wheels = [-1, 1].map((sd) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.035, 20).rotateX(Math.PI / 2), wheelMat);
      w.position.set(0, 0.06, sd * 0.14);
      w.add(new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.11, 0.04), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }))); // spoke so spin is visible
      bot.add(w); return w;
    });
    const puck = new THREE.Group();
    puck.position.y = 0.17;
    puck.add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })));
    const puckLed = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    puckLed.position.set(0.045, 0.024, 0); puck.add(puckLed);
    bot.add(puck);

    // lidar rays + hit points
    const RAYS = touchMode ? 48 : 72, RANGE = 1.5;
    const rayPos = new Float32Array(RAYS * 6), hitPos = new Float32Array(RAYS * 3);
    const rayGeo = new THREE.BufferGeometry(); rayGeo.setAttribute("position", new THREE.BufferAttribute(rayPos, 3).setUsage(THREE.DynamicDrawUsage));
    const hitGeo = new THREE.BufferGeometry(); hitGeo.setAttribute("position", new THREE.BufferAttribute(hitPos, 3).setUsage(THREE.DynamicDrawUsage));
    const rayLines = new THREE.LineSegments(rayGeo, new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
    const hitPts = new THREE.Points(hitGeo, new THREE.PointsMaterial({ color: 0xffb454, size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    rayLines.frustumCulled = hitPts.frustumCulled = false;
    robotG.add(rayLines, hitPts);

    // planner: 8-connected A* on the inflated grid
    function astar(si, sj, ti, tj) {
      const N = GW * GH, g = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
      const open = [idxOf(si, sj)]; g[open[0]] = 0;
      const h = (i, j) => { const dx = Math.abs(i - ti), dy = Math.abs(j - tj); return (dx + dy) + (1.4142 - 2) * Math.min(dx, dy); };
      const f = new Float32Array(N); f[open[0]] = h(si, sj);
      while (open.length) {
        let bi = 0; for (let k = 1; k < open.length; k++) if (f[open[k]] < f[open[bi]]) bi = k;
        const cur = open.splice(bi, 1)[0];
        if (closed[cur]) continue;
        closed[cur] = 1;
        const ci = cur % GW, cj = (cur / GW) | 0;
        if (ci === ti && cj === tj) {
          const out = []; for (let n = cur; n !== -1; n = came[n]) out.push([gx(n % GW), gz((n / GW) | 0)]);
          return out.reverse();
        }
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          const a = ci + di, b = cj + dj;
          if (a < 0 || b < 0 || a >= GW || b >= GH || blocked[idxOf(a, b)] || closed[idxOf(a, b)]) continue;
          if (di && dj && (blocked[idxOf(ci + di, cj)] || blocked[idxOf(ci, cj + dj)])) continue; // no corner cutting
          const n = idxOf(a, b), ng = g[cur] + (di && dj ? 1.4142 : 1);
          if (ng < g[n]) { g[n] = ng; came[n] = cur; f[n] = ng + h(a, b); open.push(n); }
        }
      }
      return null;
    }

    const pose = { x: gx(1), z: gz(1), h: 0 };
    let path = [], pi = 0, goal = null, wait = 0, speed = 0, travelled = 0;
    const PATH_MAX = 400;
    const pathPos = new Float32Array(PATH_MAX * 3);
    const pathGeo = new THREE.BufferGeometry(); pathGeo.setAttribute("position", new THREE.BufferAttribute(pathPos, 3).setUsage(THREE.DynamicDrawUsage));
    pathGeo.setDrawRange(0, 0);
    const pathLine = new THREE.Line(pathGeo, new THREE.LineBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.95 }));
    pathLine.frustumCulled = false;
    const goalMark = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    goalMark.position.y = 0.04; goalMark.visible = false;
    robotG.add(pathLine, goalMark);

    function pickGoal() {
      const [si, sj] = cellOf(pose.x, pose.z);
      for (let tries = 0; tries < 40; tries++) {
        const ti = 1 + Math.floor(Math.random() * (GW - 2)), tj = 1 + Math.floor(Math.random() * (GH - 2));
        if (blocked[idxOf(ti, tj)] || Math.hypot(ti - si, tj - sj) < 8) continue;
        const p = astar(Math.min(GW - 1, Math.max(0, si)), Math.min(GH - 1, Math.max(0, sj)), ti, tj);
        if (p && p.length > 3) { path = p; pi = 1; goal = [gx(ti), gz(tj)]; goalMark.position.set(goal[0], 0.04, goal[1]); goalMark.visible = true; return; }
      }
      path = []; goal = null;
    }

    function scanLidar(t) {
      const spin = t * 6;
      const y = 0.17;
      rayPos.fill(0);
      for (let r = 0; r < RAYS; r++) {
        const a = pose.h + spin + (r / RAYS) * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
        let d = 0, hit = false;
        while (d < RANGE) {
          d += 0.05;
          const px = pose.x + dx * d, pz = pose.z + dz * d, [ci, cj] = cellOf(px, pz);
          if (ci < 0 || cj < 0 || ci >= GW || cj >= GH) { hit = true; break; }
          const n = idxOf(ci, cj);
          if (occ[n]) { if (known[n] !== 2) { known[n] = 2; knownCount++; mapDirty = true; cellLevel[n] = 0.01; } hit = true; break; }
          if (!known[n]) { known[n] = 1; mapDirty = true; cellLevel[n] = 0.01; }
        }
        const o = r * 6;
        rayPos[o] = pose.x; rayPos[o + 1] = y; rayPos[o + 2] = pose.z;
        rayPos[o + 3] = pose.x + dx * d; rayPos[o + 4] = y; rayPos[o + 5] = pose.z + dz * d;
        hitPos[r * 3] = hit ? rayPos[o + 3] : pose.x; hitPos[r * 3 + 1] = hit ? y : -9; hitPos[r * 3 + 2] = hit ? rayPos[o + 5] : pose.z;
      }
      rayGeo.attributes.position.needsUpdate = true; hitGeo.attributes.position.needsUpdate = true;
    }

    let mapAcc = 0;
    function updateRobot(t, dt) {
      const v = reduceMotion ? 0.3 : 0.75;
      if (!goal) { wait -= dt; if (wait <= 0) { pickGoal(); wait = 0.6; } speed *= 0.9; }
      else {
        const tgt = path[Math.min(pi, path.length - 1)];
        const dx = tgt[0] - pose.x, dz = tgt[1] - pose.z, dist = Math.hypot(dx, dz);
        const err = wrapPi(Math.atan2(dz, dx) - pose.h);
        pose.h += clamp(err, -5 * dt, 5 * dt);
        const target = v * Math.max(0.12, Math.cos(Math.min(Math.abs(err), 1.5)));
        speed += (target - speed) * (1 - Math.exp(-dt * 6));
        pose.x += Math.cos(pose.h) * speed * dt; pose.z += Math.sin(pose.h) * speed * dt;
        travelled += speed * dt;
        if (dist < 0.09) pi++;
        if (pi >= path.length) { goal = null; goalMark.visible = false; wait = 0.8; pathGeo.setDrawRange(0, 0); }
      }
      bot.position.set(pose.x, 0, pose.z);
      bot.rotation.y = -pose.h;
      const wr = (speed / 0.06) * dt;
      wheels[0].rotation.z -= wr; wheels[1].rotation.z -= wr;
      puck.rotation.y += dt * 14;
      scanLidar(t);

      // remaining path polyline
      if (goal) {
        let n = 0;
        pathPos[n++] = pose.x; pathPos[n++] = 0.05; pathPos[n++] = pose.z;
        for (let k = pi; k < path.length && n < PATH_MAX * 3; k++) { pathPos[n++] = path[k][0]; pathPos[n++] = 0.05; pathPos[n++] = path[k][1]; }
        pathGeo.setDrawRange(0, n / 3);
        pathGeo.attributes.position.needsUpdate = true;
        const s = 1 + 0.2 * Math.sin(t * 6); goalMark.scale.set(s, 1, s);
      }

      // fade-in + upload discovered map cells
      if (mapDirty || mapAcc > 0) {
        let busy = false;
        const aC = tmpColor;
        for (let n = 0; n < known.length; n++) {
          if (!known[n]) continue;
          let lv = cellLevel[n];
          if (lv >= 1) continue;
          lv = Math.min(1, lv + dt * 2.5); cellLevel[n] = lv; busy = true;
          if (known[n] === 1) { aC.setRGB(0.04 * lv + 0.0, 0.16 * lv, 0.26 * lv); freeMesh.setColorAt(n, aC); }
          else { aC.setRGB(1.0 * lv, 0.62 * lv, 0.2 * lv); capMesh.setColorAt(capOf[n], aC); }
        }
        freeMesh.instanceColor.needsUpdate = true; capMesh.instanceColor.needsUpdate = true;
        mapDirty = false; mapAcc = busy ? 1 : 0;
      }
      // reset map once the arena is fully explored so the mapping loops forever
      let freeKnown = 0;
      if (((t * 4) | 0) % 8 === 0) { for (let n = 0; n < known.length; n++) if (known[n] === 1) freeKnown++; if (freeKnown > freeTotal * 0.93) resetMap(); }
    }
    function resetMap() {
      known.fill(0); cellLevel.fill(0); knownCount = 0;
      const black = new THREE.Color(0, 0, 0);
      for (let n = 0; n < known.length; n++) { freeMesh.setColorAt(n, black); if (capOf[n] >= 0) capMesh.setColorAt(capOf[n], black); }
      freeMesh.instanceColor.needsUpdate = true; capMesh.instanceColor.needsUpdate = true;
    }

    /* ============================================================
       SCENE 3 — flight attitude gimbal (ARIES v3 IMU fusion concept)
       ============================================================ */
    const gimbal = groups.gimbal;
    const std = (color, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: color, metalness: 0.75, roughness: 0.3 }, extra || {}));
    const ringMat = {
      yaw: std(0x38bdf8, { emissive: 0x0a4a66 }),
      pitch: std(0xf5b942, { emissive: 0x5a3c00 }),
      roll: std(0x4ade80, { emissive: 0x0b4a24 }),
    };
    const torus = (R, tube, mat) => new THREE.Mesh(new THREE.TorusGeometry(R, tube, 16, 96), mat);
    const compass = torus(1.95, 0.012, new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.8 }));
    compass.rotation.x = Math.PI / 2; gimbal.add(compass);
    const nTick = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.22), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    nTick.position.set(0, 0, -1.95); gimbal.add(nTick);
    const horizon = new THREE.Mesh(new THREE.CircleGeometry(1.95, 64),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }));
    horizon.rotation.x = -Math.PI / 2; gimbal.add(horizon);
    const grid = new THREE.GridHelper(3.6, 12, ACCENT, ACCENT);
    grid.material.transparent = true; grid.material.opacity = 0.18; grid.material.depthWrite = false; gimbal.add(grid);

    // yaw (about Y) -> pitch (about Z) -> roll (about X); vehicle nose points +X
    const yawG = new THREE.Group(), pitchG = new THREE.Group(), rollG = new THREE.Group();
    gimbal.add(yawG); yawG.add(pitchG); pitchG.add(rollG);
    yawG.add(torus(1.6, 0.03, ringMat.yaw));
    const pr = torus(1.25, 0.03, ringMat.pitch); pr.rotation.y = Math.PI / 2; pitchG.add(pr);
    const rr2 = torus(0.9, 0.03, ringMat.roll); rr2.rotation.x = Math.PI / 2; rollG.add(rr2);
    const hull = std(0xe2e8f0, { metalness: 0.4, roughness: 0.35 });
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.8, 16), hull); fus.rotation.z = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.24, 16), std(0xef4444, { metalness: 0.3 })); nose.rotation.z = -Math.PI / 2; nose.position.x = 0.52;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.018, 1.2), hull); wing.position.x = 0.05;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.02), hull); fin.position.set(-0.34, 0.13, 0);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.014, 0.5), hull); tail.position.set(-0.34, 0.02, 0);
    rollG.add(fus, nose, wing, fin, tail);

    const att = { pitch: 0, roll: 0, yaw: 0 };
    function updateGimbal(t, dt) {
      const k = reduceMotion ? 0.2 : 1;
      const truth = {
        pitch: 0.38 * Math.sin(t * 0.7 * k) + 0.1 * Math.sin(t * 1.9 * k),
        roll: 0.62 * Math.sin(t * 0.5 * k + 1),
        yaw: 0.9 * Math.sin(t * 0.28 * k) + 0.2 * Math.sin(t * 0.9 * k),
      };
      const a = 1 - Math.exp(-dt * 6);
      for (const name of ["pitch", "roll", "yaw"]) att[name] += ((truth[name] + (Math.random() - 0.5) * 0.06) - att[name]) * a;
      yawG.rotation.y = att.yaw; pitchG.rotation.z = att.pitch; rollG.rotation.x = att.roll;
    }

    /* ---------- HUD text (10 Hz, only the active scene) ---------- */
    let hudAcc = 0;
    const sgn = (v) => (v >= 0 ? "+" : "") + v.toFixed(1);
    function updateHud(dt) {
      hudAcc += dt;
      if (hudAcc < 0.1) return;
      hudAcc = 0;
      if (current === "gimbal") {
        const d = (r) => r * 180 / Math.PI;
        if (hudEls.pitch) hudEls.pitch.textContent = sgn(d(att.pitch)) + "°";
        if (hudEls.roll) hudEls.roll.textContent = sgn(d(att.roll)) + "°";
        if (hudEls.yaw) hudEls.yaw.textContent = (((d(att.yaw) % 360) + 360) % 360).toFixed(1) + "°";
      } else if (current === "robot") {
        let fk = 0; for (let n = 0; n < known.length; n++) if (known[n]) fk++;
        if (hudEls.map) hudEls.map.textContent = Math.round((fk / (GW * GH)) * 100) + "%";
        if (hudEls.goal) hudEls.goal.textContent = goal ? Math.hypot(goal[0] - pose.x, goal[1] - pose.z).toFixed(2) + " m" : "--";
        if (hudEls.speed) hudEls.speed.textContent = speed.toFixed(2) + " m/s";
      }
    }

    /* ---------- scene switching ---------- */
    let current = "logic";
    const reveal = { logic: 1, robot: 0, gimbal: 0 };
    SCENES.forEach((n) => { groups[n].visible = n === current; groups[n].scale.setScalar(n === current ? 1 : 0.001); });
    function setScene(name) {
      if (name === current || !groups[name]) return;
      current = name;
      stage.dataset.scene = name;
      pills.forEach((b) => {
        const on = b.dataset.scene === name;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      if (caption) caption.textContent = CAPTIONS[name];
      kick();
    }
    pills.forEach((b) => b.addEventListener("click", () => setScene(b.dataset.scene)));
    if (caption) caption.textContent = CAPTIONS.logic;

    /* ---------- interaction: parallax, drag + spring return, touch sway ---------- */
    const drag = { x: 0, y: 0, vx: 0, vy: 0, held: false };
    const mouse = { x: 0, y: 0 };
    if (!touchMode) {
      window.addEventListener("pointermove", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
      let lx = 0, ly = 0;
      host.style.cursor = "grab";
      host.addEventListener("pointerdown", (e) => {
        drag.held = true; lx = e.clientX; ly = e.clientY; host.style.cursor = "grabbing";
        try { host.setPointerCapture(e.pointerId); } catch (_) {}
      });
      host.addEventListener("pointermove", (e) => {
        if (!drag.held) return;
        drag.y += (e.clientX - lx) * 0.012;
        drag.x = clamp(drag.x + (e.clientY - ly) * 0.012, -1.0, 1.0);
        drag.vx = drag.vy = 0; lx = e.clientX; ly = e.clientY;
      });
      const end = () => { drag.held = false; host.style.cursor = "grab"; };
      host.addEventListener("pointerup", end);
      host.addEventListener("pointercancel", end);
    }
    const par = { x: 0, y: 0 };
    const qT = new THREE.Quaternion(), eT = new THREE.Euler(0, 0, 0, "YXZ");
    const SWAY = { logic: 0.24, robot: 0.3, gimbal: 0.55 };

    function updateRig(t, dt) {
      if (!drag.held) { // underdamped spring back to rest
        drag.vx += -drag.x * 60 * dt; drag.vy += -drag.y * 60 * dt;
        const damp = Math.exp(-dt * 7);
        drag.vx *= damp; drag.vy *= damp;
        drag.x += drag.vx * dt; drag.y += drag.vy * dt;
      }
      par.x += (mouse.x - par.x) * (1 - Math.exp(-dt * 5));
      par.y += (mouse.y - par.y) * (1 - Math.exp(-dt * 5));
      const amp = SWAY[current];
      let ex, ey, ez;
      if (touchMode || reduceMotion) { ey = Math.sin(t * 0.35) * amp; ex = 0.08; ez = 0; }
      else { ey = Math.sin(t * 0.4) * amp + drag.y; ex = par.y * 0.26 + drag.x + 0.03; ez = -par.x * 0.2; }
      eT.set(ex, ey, ez, "YXZ"); qT.setFromEuler(eT);
      rig.quaternion.slerp(qT, 1 - Math.exp(-dt * 7));
      for (const n of SCENES) {
        reveal[n] += ((current === n ? 1 : 0) - reveal[n]) * (1 - Math.exp(-dt * 9));
        groups[n].visible = reveal[n] > 0.02;
        groups[n].scale.setScalar(Math.max(0.001, reveal[n] * fit[n]));
      }
    }

    /* ---------- theme + sizing ---------- */
    function applyTheme() {
      const dark = isDark();
      ambient.intensity = dark ? 0.45 : 0.6; key.intensity = dark ? 1.0 : 1.1;
      renderer.toneMappingExposure = dark ? 1.05 : 1.15;
    }
    onThemeChange(applyTheme);

    function resize() {
      const w = Math.max(host.clientWidth, 1), hgt = Math.max(host.clientHeight, 1);
      renderer.setSize(w, hgt, false);
      camera.aspect = w / hgt; camera.updateProjectionMatrix();
      const visW = 4.03 * (w / hgt);
      for (const n of SCENES) fit[n] = clamp((visW * 0.96) / NEED_W[n], 0.4, 1);
    }
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
    window.addEventListener("resize", resize);

    /* ---------- loop registration ---------- */
    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => {
        visible = en[0].isIntersecting;
        if (visible) kick();
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }, { threshold: 0 }).observe(stage);
    }
    items.push({
      active: () => visible,
      frame(t, dt) {
        updateRig(t, dt);
        if (groups.logic.visible && current === "logic") updateLogic(t, dt);
        if (groups.robot.visible && current === "robot") updateRobot(t, dt);
        if (groups.gimbal.visible && current === "gimbal") updateGimbal(t, dt);
        updateHud(dt);
        renderer.render(scene, camera);
      },
    });

    applyTheme();
    resize();
    for (let i = 0; i < 14; i++) logicTick(); // pre-fill the pipeline
    tickT = 0;
    pickGoal();
    kick();
  }

  window.initThreeScene = initThreeScene;
})();
