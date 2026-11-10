// swarm-build: a swarm of named cursors builds an image or a whole page, piece by piece.
// Dependency-free ES module. MIT licensed. See README.md and skills/swarm-build/SKILL.md.

export const DEFAULT_AGENTS = [
  { name: "Ava", color: "#2563eb", text: "#fff" },
  { name: "Kai", color: "#e11d48", text: "#fff" },
  { name: "Noor", color: "#15803d", text: "#fff" },
  { name: "Theo", color: "#f59e0b", text: "#17171a" },
  { name: "Mia", color: "#9333ea", text: "#fff" },
  { name: "Ravi", color: "#0e7490", text: "#fff" },
];

/** A header, a sidebar, a main block and two cards: a fallback for when no regions are given. */
export function autoRegions() {
  return [
    { x: 0, y: 0, w: 100, h: 12 },
    { x: 0, y: 12, w: 28, h: 88 },
    { x: 28, y: 12, w: 72, h: 42 },
    { x: 28, y: 54, w: 36, h: 46 },
    { x: 64, y: 54, w: 36, h: 46 },
  ];
}

/** Parses "x y w h, x y w h" (percent of the image) into regions. */
export function parseRegions(text) {
  return text
    .split(/[,;]/)
    .map((part) => part.trim().split(/\s+/).map(Number))
    .filter((n) => n.length === 4 && n.every(Number.isFinite))
    .map(([x, y, w, h]) => ({ x, y, w, h }));
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t) => 1 - (1 - t) ** 2;
const easeIn = (t) => t * t;
const lerp = (a, b, t) => a + (b - a) * t;
const inset = ({ x, y, w, h }, hPct = h) => `inset(${y}% ${100 - x - w}% ${100 - y - hPct}% ${x}%)`;
// Hides an element. The sweep reaches 40px past its edges so most shadows show as it builds;
// larger glows, and the element's own clip-path, return when the sweep ends.
const HIDDEN = "inset(0 0 100% 0)";
const sweep = (e) => `inset(-40px -40px calc(${(1 - e) * 100}% - ${e * 40}px) -40px)`;
const ABORT = Symbol("swarm-build destroyed");

function el(tag, style, parent) {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  parent?.appendChild(node);
  return node;
}

// Built with DOM calls, not innerHTML, so it works under strict CSP and Trusted Types.
function cursorIcon(color) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  const path = document.createElementNS(ns, "path");
  for (const [k, v] of Object.entries({ width: 16, height: 20, viewBox: "0 0 16 20" })) svg.setAttribute(k, v);
  for (const [k, v] of Object.entries({
    d: "M1.5 1.5v15l4-4 3 6.2 2.6-1.2-3-6.1h5.6z",
    fill: color,
    stroke: "#fff",
    "stroke-width": 1.5,
    "stroke-linejoin": "round",
  }))
    path.setAttribute(k, v);
  Object.assign(svg.style, { display: "block", filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.25))" });
  svg.appendChild(path);
  return svg;
}

function imageSource(node) {
  if (node instanceof HTMLImageElement) return node.currentSrc || node.src;
  return getComputedStyle(node).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1] ?? "";
}

/** Plain text a block can type in, or null when it holds elements or too much text. */
function typeable(node) {
  if (![...node.childNodes].every((n) => n.nodeType === Node.TEXT_NODE)) return null;
  const text = node.textContent;
  return text.trim().length > 0 && text.length <= 240 ? text : null;
}

/** Each block's own clip-path, kept while any swarm holds it, so overlapping swarms restore it once. */
const owned = new WeakMap();
function hold(node) {
  const entry = owned.get(node) ?? { clip: node.style.clipPath, inert: node.inert, count: 0 };
  entry.count++;
  owned.set(node, entry);
  return entry;
}
function release(node) {
  const entry = owned.get(node);
  if (!entry || --entry.count > 0) return;
  owned.delete(node);
  node.style.clipPath = entry.clip;
  node.inert = entry.inert;
}

const stopped = { finished: Promise.resolve(), finish() {}, destroy() {}, setSpeed() {} };

/**
 * The shared engine: a swarm of cursors works through `tasks`. Each task is a rectangle the
 * cursor drags out, then a `reveal` tween. A task starts once it has scrolled into view and
 * its `parent` task is built.
 */
function runSwarm(tasks, { prepare, observe, settleAll, onFrame = () => {}, options }) {
  const { start = "now", zIndex = 2147483000, onDone } = options;
  const agents = options.agents?.length ? options.agents : DEFAULT_AGENTS;
  let speed = options.speed > 0 ? options.speed : 1;

  let state = "idle"; // idle, running, ended
  let done = false; // finish() was called: every tween jumps to its end
  let resolveFinished;
  const finished = new Promise((r) => (resolveFinished = r));
  const cleanups = [];

  // One loop drives every tween, the cursors and the drag boxes.
  const active = new Set();
  let frame = 0;
  let last = 0;
  const settle = (tw, t) => {
    tw.update(t);
    if (t >= 1) {
      active.delete(tw);
      tw.resolve();
    }
  };
  const tick = (now) => {
    // Clamped so a tab coming back from the background doesn't jump to the end.
    const dt = last ? Math.min(now - last, 100) * speed : 0;
    last = now;
    for (const tw of [...active]) settle(tw, Math.min(1, (tw.t += dt / tw.duration)));
    render();
    frame = requestAnimationFrame(tick);
  };
  /** Animates t from 0 to 1 over `seconds`; rejects with ABORT once the swarm has ended. */
  const tween = (seconds, update = () => {}) =>
    new Promise((resolve, reject) => {
      if (state === "ended") return reject(ABORT);
      const tw = { t: 0, duration: Math.max(1, seconds * 1000), update, resolve, reject };
      if (done) settle(tw, 1);
      else active.add(tw);
    });

  // Cursors and drag boxes live in one fixed layer and follow the page through scroll and resize.
  const stage = el("div", {
    position: "fixed",
    inset: "0",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: String(zIndex),
  });
  stage.setAttribute("aria-hidden", "true");
  document.body.appendChild(stage);
  cleanups.push(() => stage.remove());
  cleanups.push(prepare());

  // Scheduling: agents pull the first task that is in view and whose parent is built.
  const wakers = new Set();
  const wake = () => {
    wakers.forEach((r) => r());
    wakers.clear();
  };
  cleanups.push(observe(wake));
  const next = async () => {
    for (;;) {
      if (state === "ended") throw ABORT;
      const task = tasks.find((t) => !t.taken && (done || t.seen) && (!t.parent || t.parent.built));
      if (task) {
        task.taken = true;
        return task;
      }
      if (tasks.every((t) => t.taken)) return null;
      await new Promise((r) => wakers.add(r));
    }
  };

  /** An anchor is a point in fractions of a task's rectangle, or in viewport pixels. */
  const resolve = (a) => {
    if (!a.task) return a;
    const r = a.task.rect();
    return { x: r.left + a.fx * r.width, y: r.top + a.fy * r.height };
  };

  const count = Math.max(1, Math.min(agents.length, tasks.length));
  const cursors = Array.from({ length: count }, (_, a) => {
    const agent = { text: "#fff", ...agents[a % agents.length] };
    const node = el("div", { position: "absolute", left: "0", top: "0", transformOrigin: "0 0" }, stage);
    node.appendChild(cursorIcon(agent.color));
    const label = el(
      "span",
      {
        position: "absolute",
        left: "14px",
        top: "18px",
        whiteSpace: "nowrap",
        borderRadius: "999px",
        padding: "2px 8px",
        font: "600 11px/16px system-ui, sans-serif",
        background: agent.color,
        color: agent.text,
      },
      node,
    );
    label.textContent = agent.name;
    // Fan in from beyond the right half of the screen.
    const angle = ((a + 0.5) / count - 0.5) * Math.PI;
    const offstage = () => {
      const reach = Math.hypot(innerWidth, innerHeight) * 0.6;
      return { x: innerWidth / 2 + Math.cos(angle) * reach, y: innerHeight / 2 + Math.sin(angle) * reach };
    };
    const start = offstage();
    // Place it offstage now, so it never flashes at the top-left before the first frame.
    node.style.transform = `translate3d(${start.x}px, ${start.y}px, 0)`;
    return { agent, node, label, flip: false, offstage, from: start, to: start, p: 1, ease: easeInOut, scale: 1 };
  });

  const boxes = new Set();
  const render = () => {
    onFrame();
    for (const c of cursors) {
      const a = resolve(c.from);
      const b = resolve(c.to);
      const t = c.ease(c.p);
      const x = lerp(a.x, b.x, t);
      c.node.style.transform = `translate3d(${x}px, ${lerp(a.y, b.y, t)}px, 0) scale(${c.scale})`;
      // Near the right edge the name tag sits left of the arrow, so it is never cut off.
      c.labelWidth ||= c.label.offsetWidth;
      const flip = x > innerWidth - c.labelWidth - 24;
      if (flip !== c.flip) {
        c.flip = flip;
        c.label.style.transform = flip ? "translateX(calc(-100% - 16px))" : "";
      }
    }
    for (const b of boxes) {
      const r = b.task.rect();
      Object.assign(b.node.style, {
        transform: `translate3d(${r.left}px, ${r.top}px, 0)`,
        width: `${b.e * r.width}px`,
        height: `${b.e * r.height}px`,
      });
    }
  };

  const move = (c, to, seconds, ease = easeInOut, update = () => {}) => {
    c.from = c.to;
    c.to = to;
    c.ease = ease;
    c.p = 0;
    return tween(seconds, (t) => {
      c.p = t;
      update(t);
    });
  };

  async function draw(c, task) {
    const box = {
      task,
      e: 0,
      node: el(
        "div",
        {
          position: "absolute",
          left: "0",
          top: "0",
          border: `1px solid ${c.agent.color}`,
          borderRadius: task.radius ?? "0",
          background: "rgb(128 128 128 / 0.10)",
          boxSizing: "border-box",
          // Hidden until its cursor arrives, so it never shows at the stage's corner.
          visibility: "hidden",
        },
        stage,
      ),
    };
    // Below the box, or inside its bottom edge when the box reaches the screen's bottom.
    const badge = el(
      "span",
      {
        position: "absolute",
        left: "50%",
        top: "100%",
        marginTop: "4px",
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
        borderRadius: "3px",
        padding: "1px 4px",
        font: "500 10px/14px system-ui, sans-serif",
        fontVariantNumeric: "tabular-nums",
        background: c.agent.color,
        color: c.agent.text,
      },
      box.node,
    );

    await move(c, { task, fx: 0, fy: 0 }, 0.7);
    c.scale = 0.85;
    boxes.add(box);
    render();
    box.node.style.visibility = "";
    const { width, height } = task.size();
    if (task.rect().bottom > innerHeight - 24) Object.assign(badge.style, { top: "auto", bottom: "4px" });
    const area = Math.min(1, (task.rect().width * task.rect().height) / (innerWidth * innerHeight));
    await move(c, { task, fx: 1, fy: 1 }, 0.4 + area * 0.6, easeInOut, (t) => {
      box.e = easeInOut(t);
      const w = Math.round(box.e * width);
      const h = Math.round(box.e * height);
      // No "0 × 0" tag while the drag is just starting.
      badge.style.visibility = w && h ? "" : "hidden";
      badge.textContent = `${w} × ${h}`;
    });
    c.scale = 1;
    await task.reveal(tween, c);
    task.built = true;
    wake();
    tween(0.25, (t) => (box.node.style.opacity = String(1 - t)))
      .catch(() => {})
      .finally(() => {
        boxes.delete(box);
        box.node.remove();
      });
  }

  async function run() {
    frame = requestAnimationFrame(tick);
    await Promise.all(
      cursors.map(async (c, a) => {
        await tween(a * 0.2);
        for (let task = await next(); task; task = await next()) await draw(c, task);
      }),
    );
    const exits = cursors.map((c) => tween(0.2).then(() => move(c, c.offstage(), 0.9, easeIn)));
    await settleAll(tween);
    await Promise.all(exits);
  }

  /** Removes everything the swarm added; `completed` decides whether onDone runs. */
  const end = (completed) => {
    if (state === "ended") return;
    state = "ended";
    cancelAnimationFrame(frame);
    active.forEach((tw) => tw.reject(ABORT));
    active.clear();
    wake();
    cleanups.splice(0).reverse().forEach((fn) => fn());
    if (completed) onDone?.();
    resolveFinished();
  };

  const begin = () => {
    if (state !== "idle") return;
    state = "running";
    run().then(
      () => end(true),
      (error) => {
        if (error !== ABORT) console.error("swarm-build:", error);
        end(error !== ABORT);
      },
    );
  };

  if (start === "now") begin();
  else {
    // Start once the first task scrolls into view.
    const waitForView = async () => {
      while (state === "idle" && !tasks.some((t) => t.seen)) await new Promise((r) => wakers.add(r));
      begin();
    };
    waitForView();
  }

  return {
    finished,
    /** Jumps to the finished result and removes the swarm; onDone runs. */
    finish() {
      if (state === "idle") return end(true);
      if (state !== "running") return;
      done = true;
      wake();
      [...active].forEach((tw) => settle(tw, 1));
    },
    /** Removes everything now, wherever the build is; onDone does not run. */
    destroy() {
      end(false);
    },
    /** Changes the speed while it runs: 2 is twice as fast. */
    setSpeed(value) {
      if (value > 0) speed = value;
    },
  };
}

/** Marks tasks as seen when their element scrolls into view. */
function viewWatcher(tasks, nodeOf) {
  return (wake) => {
    const byNode = new Map();
    tasks.forEach((t) => {
      const node = nodeOf(t);
      if (!byNode.has(node)) byNode.set(node, []);
      byNode.get(node).push(t);
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          byNode.get(e.target)?.forEach((t) => (t.seen = true));
          io.unobserve(e.target);
        }
        wake();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    byNode.forEach((_, node) => io.observe(node));
    return () => io.disconnect();
  };
}

function shouldSkip(nodes) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The CSS fallback already showed the content: too late to build it.
  const fallbackShown = nodes.some((node) =>
    node.getAnimations?.().some((a) => a.animationName === "swarm-build-fallback" && a.playState === "finished"),
  );
  return reduced || fallbackShown || nodes.length === 0;
}

function normalizeImages(targets) {
  const list = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);
  return list.flatMap((t) => {
    const node = t instanceof Element ? t : t.el;
    if (!node?.parentElement) return [];
    const given = t instanceof Element ? null : t.regions;
    const parsed = node.dataset.swarmRegions ? parseRegions(node.dataset.swarmRegions) : [];
    const regions = given?.length ? given : parsed.length ? parsed : autoRegions();
    const src = (t instanceof Element ? null : t.src) || imageSource(node);
    if (!src) {
      console.warn("swarm-build: no image URL for", node);
      return [];
    }
    return [{ node, regions, src }];
  });
}

/**
 * Builds each target image region by region: a blank canvas covers the image and each region
 * of it sweeps in after a cursor drags its box. `finished` always resolves. `onDone` runs once
 * when the build completes or `finish()` is called, never after `destroy()`.
 * @param {import("./swarm-build").Target | import("./swarm-build").Target[]} targets
 * @param {import("./swarm-build").Options} [options]
 * @returns {import("./swarm-build").SwarmBuild}
 */
export function swarmBuild(targets, options = {}) {
  const items = normalizeImages(targets);
  const unpend = () => items.forEach(({ node }) => node.removeAttribute("data-swarm-pending"));
  if (shouldSkip(items.map((i) => i.node))) {
    unpend();
    options.onDone?.();
    return stopped;
  }
  const { canvas = "#fff" } = options;
  const layers = [];
  const places = [];
  const tasks = items.flatMap((item, target) =>
    item.regions.map((region) => ({ item, target, region, seen: false })),
  );

  // The image paints in its content box; tasks measure against that.
  const contentBox = (node) => {
    const cs = getComputedStyle(node);
    const px = (k) => parseFloat(cs[k]) || 0;
    const r = node.getBoundingClientRect();
    const l = px("borderLeftWidth") + px("paddingLeft");
    const t = px("borderTopWidth") + px("paddingTop");
    const width = r.width - l - px("borderRightWidth") - px("paddingRight");
    const height = r.height - t - px("borderBottomWidth") - px("paddingBottom");
    return { left: r.left + l, top: r.top + t, width, height, bottom: r.top + t + height };
  };
  tasks.forEach((task) => {
    const { node } = task.item;
    const { x, y, w, h } = task.region;
    task.rect = () => {
      const b = contentBox(node);
      const r = { left: b.left + (x / 100) * b.width, top: b.top + (y / 100) * b.height };
      return { ...r, width: (w / 100) * b.width, height: (h / 100) * b.height, bottom: r.top + (h / 100) * b.height };
    };
    task.size = () => ({
      width: ((node.naturalWidth || node.offsetWidth) * w) / 100,
      height: ((node.naturalHeight || node.offsetHeight) * h) / 100,
    });
    task.reveal = (tween) =>
      tween(0.45, (t) => (layers[task.target].tiles.get(task).style.clipPath = inset(task.region, easeOut(t) * h)));
  });

  // Per image, inside its parent so the parent's rounded corners clip it: a blank canvas plus
  // one tile of the image per region.
  const prepare = () => {
    const parents = new Map();
    const undo = [];
    items.forEach(({ node, src }, target) => {
      const parent = node.parentElement;
      if (!parents.has(parent)) {
        parents.set(parent, parent.style.position);
        if (["static", ""].includes(getComputedStyle(parent).position)) parent.style.position = "relative";
      }
      const layer = el("div", { position: "absolute", pointerEvents: "none", zIndex: "1", overflow: "hidden" });
      layer.setAttribute("aria-hidden", "true");
      node.after(layer);
      const place = () => {
        const b = contentBox(node);
        const p = parent.getBoundingClientRect();
        Object.assign(layer.style, {
          left: `${b.left - p.left - parent.clientLeft + parent.scrollLeft}px`,
          top: `${b.top - p.top - parent.clientTop + parent.scrollTop}px`,
          width: `${b.width}px`,
          height: `${b.height}px`,
          borderRadius: getComputedStyle(node).borderRadius,
        });
      };
      place();
      places.push(place);
      const observer = new ResizeObserver(place);
      observer.observe(node);
      const cover = el("div", { position: "absolute", inset: "0", background: canvas }, layer);
      const tiles = new Map();
      tasks
        .filter((t) => t.target === target)
        .forEach((t) =>
          tiles.set(
            t,
            el(
              "div",
              {
                position: "absolute",
                inset: "0",
                backgroundImage: `url(${JSON.stringify(src)})`,
                backgroundSize: "100% 100%",
                clipPath: inset(t.region, 0),
              },
              layer,
            ),
          ),
        );
      layers[target] = { cover, tiles };
      undo.push(() => {
        observer.disconnect();
        layer.remove();
      });
    });
    unpend();
    return () => {
      undo.forEach((fn) => fn());
      parents.forEach((position, parent) => (parent.style.position = position));
    };
  };

  const settleAll = (tween) => tween(0.4, (t) => layers.forEach(({ cover }) => (cover.style.opacity = String(1 - t))));
  return runSwarm(tasks, {
    prepare,
    observe: viewWatcher(tasks, (t) => t.item.node),
    settleAll,
    onFrame: () => places.forEach((place) => place()),
    options: { start: "visible", ...options },
  });
}

/**
 * Builds live page elements in place. Every block is hidden, then a cursor drags out its box and
 * it sweeps in; plain-text blocks type themselves in. A block inside another block waits for it.
 * Blocks below the fold wait until they scroll into view.
 * @param {string | Element[] | NodeListOf<Element>} [blocks] selector or elements; default "[data-swarm-block]"
 * @param {import("./swarm-build").PageOptions} [options]
 * @returns {import("./swarm-build").SwarmBuild}
 */
export function swarmBuildPage(blocks = "[data-swarm-block]", options = {}) {
  // Unique, connected and rendered: a display:none block would never scroll into view.
  const list = typeof blocks === "string" ? document.querySelectorAll(blocks) : (blocks ?? []);
  const nodes = [...new Set(list)].filter(
    (n) => n instanceof Element && n.isConnected && n.checkVisibility?.() !== false,
  );
  const unpend = () => nodes.forEach((n) => n.removeAttribute("data-swarm-pending"));
  if (shouldSkip(nodes)) {
    unpend();
    options.onDone?.();
    return stopped;
  }
  const typeSpeed = options.typeSpeed > 0 ? options.typeSpeed : 1;

  // Document order is reading order: top to bottom, parents before children.
  const tasks = nodes.map((node) => ({ node, seen: false }));
  const byNode = new Map(tasks.map((t) => [t.node, t]));
  tasks.forEach((task) => {
    for (let p = task.node.parentElement; p && !task.parent; p = p.parentElement) task.parent = byNode.get(p);
    const { node } = task;
    task.rect = () => node.getBoundingClientRect();
    task.size = () => ({ width: node.offsetWidth, height: node.offsetHeight });
    task.radius = getComputedStyle(node).borderRadius;
    task.text = typeable(node);
    task.reveal = async (tween) => {
      // Focusable again as soon as it starts to show, unless another swarm still hides it.
      if (owned.get(node)?.count <= 1) node.inert = task.inert;
      if (!task.text) {
        await tween(0.45, (t) => (node.style.clipPath = sweep(easeOut(t))));
        node.style.clipPath = task.clip;
        return;
      }
      // Type into one span holding a transparent copy of the rest, so the block keeps its size
      // and a flex block still has a single child.
      const original = [...node.childNodes];
      const typed = document.createTextNode("");
      const rest = el("span", { color: "transparent" });
      const line = el("span");
      line.append(typed, rest);
      node.replaceChildren(line);
      node.style.clipPath = task.clip;
      const text = task.text;
      const restore = () => node.replaceChildren(...original);
      task.restore = restore;
      await tween(Math.min(1.6, 0.15 + text.length * 0.03) / typeSpeed, (t) => {
        const n = Math.round(t * text.length);
        typed.data = text.slice(0, n);
        rest.textContent = text.slice(n);
      });
      restore();
      task.restore = null;
    };
  });

  const prepare = () => {
    tasks.forEach((t) => {
      ({ clip: t.clip, inert: t.inert } = hold(t.node));
      t.node.style.clipPath = HIDDEN;
      // Hidden blocks are out of the tab order and the accessibility tree.
      t.node.inert = true;
    });
    unpend();
    return () =>
      tasks.forEach((t) => {
        t.restore?.();
        release(t.node);
      });
  };

  return runSwarm(tasks, {
    prepare,
    observe: viewWatcher(tasks, (t) => t.node),
    settleAll: async () => {},
    options,
  });
}

/** Builds every element with a `data-swarm` attribute, each with its own swarm. */
export function swarmBuildAll(selector = "[data-swarm]", options) {
  return [...document.querySelectorAll(selector)].map((node) => swarmBuild(node, options));
}
