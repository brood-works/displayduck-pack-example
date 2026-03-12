const y = /* @__PURE__ */ new Map(), E = (t) => String(t ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"), _ = (t) => {
  const e = y.get(t);
  if (e)
    return e;
  const r = t.replace(/\bthis\b/g, "__item"), s = new Function("scope", `with (scope) { return (${r}); }`);
  return y.set(t, s), s;
}, h = (t, e) => {
  try {
    return _(t)(e);
  } catch {
    return "";
  }
}, f = (t, e = 0, r) => {
  const s = [];
  let n = e;
  for (; n < t.length; ) {
    const i = t.indexOf("{{", n);
    if (i === -1)
      return s.push({ type: "text", value: t.slice(n) }), { nodes: s, index: t.length };
    i > n && s.push({ type: "text", value: t.slice(n, i) });
    const o = t.indexOf("}}", i + 2);
    if (o === -1)
      return s.push({ type: "text", value: t.slice(i) }), { nodes: s, index: t.length };
    const c = t.slice(i + 2, o).trim();
    if (n = o + 2, c === "/if" || c === "/each") {
      if (r === c)
        return { nodes: s, index: n };
      s.push({ type: "text", value: `{{${c}}}` });
      continue;
    }
    if (c.startsWith("#if ")) {
      const a = f(t, n, "/if");
      s.push({
        type: "if",
        condition: c.slice(4).trim(),
        children: a.nodes
      }), n = a.index;
      continue;
    }
    if (c.startsWith("#each ")) {
      const a = f(t, n, "/each");
      s.push({
        type: "each",
        source: c.slice(6).trim(),
        children: a.nodes
      }), n = a.index;
      continue;
    }
    s.push({ type: "expr", value: c });
  }
  return { nodes: s, index: n };
}, p = (t, e) => {
  let r = "";
  for (const s of t) {
    if (s.type === "text") {
      r += s.value;
      continue;
    }
    if (s.type === "expr") {
      r += E(h(s.value, e));
      continue;
    }
    if (s.type === "if") {
      h(s.condition, e) && (r += p(s.children, e));
      continue;
    }
    const n = h(s.source, e);
    if (Array.isArray(n))
      for (const i of n) {
        const o = Object.create(e);
        o.__item = i, r += p(s.children, o);
      }
  }
  return r;
}, w = (t) => {
  const e = f(t).nodes;
  return (r) => p(e, r);
};
function W(t, e = "asset") {
  return window.__TAURI_INTERNALS__.convertFileSrc(t, e);
}
var m;
(function(t) {
  t.WINDOW_RESIZED = "tauri://resize", t.WINDOW_MOVED = "tauri://move", t.WINDOW_CLOSE_REQUESTED = "tauri://close-requested", t.WINDOW_DESTROYED = "tauri://destroyed", t.WINDOW_FOCUS = "tauri://focus", t.WINDOW_BLUR = "tauri://blur", t.WINDOW_SCALE_FACTOR_CHANGED = "tauri://scale-change", t.WINDOW_THEME_CHANGED = "tauri://theme-changed", t.WINDOW_CREATED = "tauri://window-created", t.WEBVIEW_CREATED = "tauri://webview-created", t.DRAG_ENTER = "tauri://drag-enter", t.DRAG_OVER = "tauri://drag-over", t.DRAG_DROP = "tauri://drag-drop", t.DRAG_LEAVE = "tauri://drag-leave";
})(m || (m = {}));
const x = (t) => {
  if (typeof t != "function")
    return !1;
  const e = t;
  return e._isSignal === !0 && typeof e.set == "function" && typeof e.subscribe == "function";
}, d = (t) => {
  let e = t;
  const r = /* @__PURE__ */ new Set(), s = (() => e);
  return s._isSignal = !0, s.set = (n) => {
    e = n;
    for (const i of r)
      i(e);
  }, s.update = (n) => {
    s.set(n(e));
  }, s.subscribe = (n) => (r.add(n), () => r.delete(n)), s;
}, O = (t, e) => {
  const r = [];
  for (const s of Object.keys(t)) {
    const n = t[s];
    x(n) && r.push(n.subscribe(() => e()));
  }
  return () => {
    for (const s of r)
      s();
  };
}, R = (t, e) => new Proxy(
  { payload: e },
  {
    get(r, s) {
      if (typeof s != "string")
        return;
      if (s in r)
        return r[s];
      const n = t[s];
      return typeof n == "function" ? n.bind(t) : n;
    },
    has(r, s) {
      return typeof s != "string" ? !1 : s in r || s in t;
    }
  }
), v = ["src", "href", "poster"], L = "{{plugin-install-path}}/", b = "{{ASSETS}}", I = (t) => {
  const e = t.trim();
  return e.length === 0 || e.startsWith("data:") || e.startsWith("blob:") || e.startsWith("http://") || e.startsWith("https://") || e.startsWith("file:") || e.startsWith("asset:") || e.startsWith("mailto:") || e.startsWith("tel:") || e.startsWith("javascript:") || e.startsWith("//") || e.startsWith("/") || e.startsWith("#");
}, U = (t) => {
  const e = t.trim();
  if (!e)
    return null;
  if (!I(e))
    return e.replace(/^\.\/+/, "").replace(/^\/+/, "");
  if (e.startsWith("http://") || e.startsWith("https://"))
    try {
      const r = new URL(e);
      if (r.origin === window.location.origin)
        return `${r.pathname}${r.search}${r.hash}`.replace(/^\/+/, "");
    } catch {
      return null;
    }
  return null;
}, N = (t, e) => {
  const r = t.replaceAll("\\", "/").replace(/\/+$/, ""), s = `${r}/${e.trim()}`, n = s.split("/"), i = [];
  for (const o of n) {
    if (!o || o === ".") {
      i.length === 0 && s.startsWith("/") && i.push("");
      continue;
    }
    if (o === "..") {
      (i.length > 1 || i.length === 1 && i[0] !== "") && i.pop();
      continue;
    }
    i.push(o);
  }
  return i.join("/") || r;
}, l = (t, e) => {
  const r = U(e);
  if (!t || !r)
    return e;
  try {
    return W(N(t, r));
  } catch {
    return e;
  }
}, C = (t) => {
  const e = t.trim().replaceAll("\\", "/").replace(/\/+$/, "");
  if (!e)
    return "";
  try {
    return W(e);
  } catch {
    return e;
  }
}, $ = (t, e) => t.split(",").map((r) => {
  const s = r.trim();
  if (!s)
    return s;
  const [n, i] = s.split(/\s+/, 2), o = l(e, n);
  return i ? `${o} ${i}` : o;
}).join(", "), P = (t, e) => t.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (r, s, n) => {
  const i = l(e, n);
  return i === n ? r : `url("${i}")`;
}), g = (t, e) => {
  for (const n of v) {
    const i = t.getAttribute(n);
    if (!i)
      continue;
    const o = l(e, i);
    o !== i && t.setAttribute(n, o);
  }
  const r = t.getAttribute("srcset");
  if (r) {
    const n = $(r, e);
    n !== r && t.setAttribute("srcset", n);
  }
  const s = t.getAttribute("style");
  if (s) {
    const n = P(s, e);
    n !== s && t.setAttribute("style", n);
  }
}, A = (t, e) => {
  if (e) {
    t instanceof Element && g(t, e);
    for (const r of Array.from(t.querySelectorAll("*")))
      g(r, e);
  }
}, S = (t, e) => {
  if (!e)
    return t;
  let r = t;
  const s = C(e);
  return s && r.includes(b) && (r = r.replaceAll(b, s)), r.includes(L) ? r.replace(/\{\{plugin-install-path\}\}\/([^"')\s]+)/g, (n, i) => l(e, i)) : r;
}, T = (t, e) => class {
  mount;
  payload;
  logic;
  setLoading;
  cleanups = [];
  cleanupSignalSubscriptions;
  assetObserver;
  widgetDirectory = "";
  constructor({
    mount: s,
    payload: n,
    setLoading: i
  }) {
    this.mount = s, this.payload = n ?? {}, this.setLoading = typeof i == "function" ? i : (() => {
    }), this.assetObserver = new MutationObserver((o) => {
      if (this.widgetDirectory)
        for (const c of o) {
          if (c.type === "attributes" && c.target instanceof Element) {
            g(c.target, this.widgetDirectory);
            continue;
          }
          for (const a of Array.from(c.addedNodes))
            a instanceof Element && A(a, this.widgetDirectory);
        }
    }), this.logic = new t({
      mount: s,
      payload: this.payload,
      setLoading: (o) => this.setLoading(!!o),
      on: (o, c, a) => this.on(o, c, a)
    }), this.cleanupSignalSubscriptions = O(this.logic, () => this.render()), this.assetObserver.observe(this.mount, {
      subtree: !0,
      childList: !0,
      attributes: !0,
      attributeFilter: ["src", "href", "poster", "srcset", "style"]
    });
  }
  onInit() {
    this.render(), this.logic.onInit?.();
  }
  onUpdate(s) {
    this.payload = s ?? {}, this.logic.onUpdate?.(this.payload), this.render();
  }
  onDestroy() {
    for (this.cleanupSignalSubscriptions(); this.cleanups.length > 0; )
      this.cleanups.pop()?.();
    this.assetObserver.disconnect(), this.logic.onDestroy?.(), this.mount.innerHTML = "";
  }
  render() {
    const s = R(this.logic, this.payload);
    this.widgetDirectory = String(
      this.payload?.widgetDirectory ?? this.payload?.directory ?? ""
    ).trim();
    const n = S(e.template, this.widgetDirectory), i = S(e.styles, this.widgetDirectory), c = w(n)(s);
    this.mount.innerHTML = `<style>${i}</style>${c}`, this.mount.setAttribute("data-displayduck-render-empty", c.trim().length === 0 ? "true" : "false"), A(this.mount, this.widgetDirectory), this.logic.afterRender?.();
  }
  on(s, n, i) {
    const o = (a) => {
      const u = a.target?.closest(n);
      !u || !this.mount.contains(u) || i(a, u);
    };
    this.mount.addEventListener(s, o);
    const c = () => this.mount.removeEventListener(s, o);
    return this.cleanups.push(c), c;
  }
};
let k = class {
  constructor(e) {
    this.ctx = e, this.config = d(e.payload ?? {}), this.title = d(this.config().title ?? "Example widget"), this.showConfig = d(!1);
  }
  onInit() {
    this.ctx.on("click", "#btn", () => {
      this.showConfig.set(!this.showConfig());
    });
  }
  onDestroy() {
  }
};
const H = `<div class="widget">
  <h1><i class="fas fa-cog"></i> {{ title() }}</h1>
  <button id="btn">Show passed config</button>
  {{#if showConfig()}}
    <div>
      {{#each Object.entries(config().config || {})}}
        <div>{{ this[0] }}: {{ this[1] }}</div>
      {{/each}}
    </div>
  {{/if}}
</div>
`, B = ".widget{color:var(--color-text);font-size:1em}.widget button{background:var(--color-primary);font-size:1em}.widget .message{color:#4ade80}", D = T(k, { template: H, styles: B }), G = D, M = { DisplayDuckWidget: D, Widget: G };
export {
  D as DisplayDuckWidget,
  G as Widget,
  M as default
};
