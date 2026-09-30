import { LitElement as A, html as x, css as B, property as T, state as d, customElement as D } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as I } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as R } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as z } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as G } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT as X } from "@umbraco-cms/backoffice/property";
import { UmbLanguageCollectionRepository as H } from "@umbraco-cms/backoffice/language";
var K = Object.defineProperty, Y = Object.getOwnPropertyDescriptor, u = (t, e, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Y(e, i) : e, C = t.length - 1, f; C >= 0; C--)
    (f = t[C]) && (s = (r ? f(e, i, s) : f(s)) || s);
  return r && s && K(e, i, s), s;
}, O = (t, e, i) => {
  if (!e.has(t))
    throw TypeError("Cannot " + i);
}, a = (t, e, i) => (O(t, e, "read from private field"), i ? i.call(t) : e.get(t)), n = (t, e, i) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, i);
}, h = (t, e, i, r) => (O(t, e, "write to private field"), r ? r.call(t, i) : e.set(t, i), i), J = (t, e, i, r) => ({
  set _(s) {
    h(t, e, s, i);
  },
  get _() {
    return a(t, e, r);
  }
}), l = (t, e, i) => (O(t, e, "access private method"), i), g, w, m, y, _, c, p, N, W, L, b, S, V, E, U, v, q;
const Q = "NONE";
let o = class extends R(A) {
  constructor() {
    super(), n(this, N), n(this, L), n(this, S), n(this, E), n(this, v), this._isEditing = !1, this._languageList = [], this._languageError = !1, n(this, g, void 0), n(this, w, void 0), n(this, m, void 0), n(this, y, void 0), n(this, _, void 0), n(this, c, void 0), n(this, p, 0), this.consumeContext(z, (t) => {
      h(this, g, t), h(this, m, a(this, g).getUnique()), l(this, N, W).call(this);
    }), this.consumeContext(X, (t) => {
      this.observe(t.alias, (e) => {
        h(this, y, e), l(this, v, q).call(this);
      });
    }), this.consumeContext("UmbMenuStructureWorkspaceContext", (t) => {
      h(this, w, t), l(this, N, W).call(this);
    });
  }
  set config(t) {
    this._allowNull = t.getValueByAlias("allowNull"), this._uniqueFilter = t.getValueByAlias("uniqueFilter");
  }
  firstUpdated(t) {
    super.firstUpdated(t), l(this, v, q).call(this);
  }
  async handleSelectChange(t) {
    this.value = t.target.value, this.dispatchEvent(new I()), a(this, c) && (this._displayValue = l(this, E, U).call(this, await a(this, c), this.value));
  }
  renderDropdown() {
    return x`
      <uui-select
          .value=${this.value ?? ""}
          label="Select Language"
          .options=${this._languageList}
          .placeholder=${this._displayValue ?? ""}
          @change=${this.handleSelectChange}
      ></uui-select>
    `;
  }
  renderDisplayValue() {
    return x`
      <span class="editing-text">
      ${this._displayValue ? this._displayValue : this.value}
    </span>
      <uui-button
          look="secondary"
          color="default"
          class="data-api-picker-edit-label"
          role="button"
          @click=${() => this._isEditing = !this._isEditing}>
        <umb-localize key="umbracoLanguagePicker_edit">Edit</umb-localize>
      </uui-button>
    `;
  }
  render() {
    return x`
      ${this._isEditing ? this.renderDropdown() : this.renderDisplayValue()}
      ${this._languageError ? x`<p class="error-text">Error fetching languages</p>` : ""}
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakSet();
W = function() {
  var e;
  const t = a(this, g);
  t && ((e = t.getIsNew) != null && e.call(t) ? (this._isEditing = !0, t.parentUnique && this.observe(t.parentUnique, (i) => l(this, L, b).call(this, i), "parentObserver")) : a(this, w) && this.observe(
    a(this, w).structure,
    (i) => {
      i.length >= 2 && l(this, L, b).call(this, i[i.length - 2].unique);
    },
    "parentObserver"
  ));
};
L = /* @__PURE__ */ new WeakSet();
b = function(t) {
  t === void 0 || t === a(this, _) || (h(this, _, t), l(this, v, q).call(this));
};
S = /* @__PURE__ */ new WeakSet();
V = async function() {
  const { data: t } = await new H(this).requestCollection({}), e = {};
  return t == null || t.items.forEach((i) => {
    e[i.unique.toLowerCase()] = i.name;
  }), e;
};
E = /* @__PURE__ */ new WeakSet();
U = function(t, e) {
  return e ? t[e] ?? e : this._allowNull ? Q : "";
};
v = /* @__PURE__ */ new WeakSet();
q = async function() {
  const t = a(this, g), e = !!(t != null && t.parentUnique) && a(this, _) === void 0, i = !!t && (!a(this, m) || e);
  if (this._uniqueFilter && (!a(this, y) || i) || !this._uniqueFilter && a(this, p) > 0)
    return;
  const r = ++J(this, p)._;
  try {
    a(this, c) ?? h(this, c, l(this, S, V).call(this));
    const s = await a(this, c), f = await (await this.getContext(G)).getLatestToken(), $ = new URLSearchParams({
      parentNodeIdOrGuid: a(this, _) ?? "",
      nodeIdOrGuid: a(this, m) ?? "",
      propertyAlias: a(this, y) ?? "",
      uniqueFilter: String(!!this._uniqueFilter),
      allowNull: String(!!this._allowNull)
    }), k = await fetch(`/umbraco/management/api/v1/get-key-value-list?${$}`, {
      headers: { Authorization: `Bearer ${f}` }
    });
    if (!k.ok)
      throw new Error(`Fetching languages failed: ${k.status} ${k.statusText}`);
    const F = await k.json();
    if (r !== a(this, p))
      return;
    const M = this.value ?? "";
    this._languageList = F.map(({ key: P }) => ({
      name: l(this, E, U).call(this, s, P),
      value: P,
      selected: P === M
    })), this._displayValue = l(this, E, U).call(this, s, M), this._languageError = !1;
  } catch (s) {
    if (r !== a(this, p))
      return;
    this._languageError = !0, console.error(s);
  }
};
o.styles = [
  B`
      .data-api-picker-edit-label {
        font-size: 13px;
      }
      .data-api-picker-edit-label:hover {
        color: #515054;
      }

      .editing-text {
        padding-right: 12px;
      }

      .error-text {
        color: var(--uui-color-danger);
      }
    `
];
u([
  T()
], o.prototype, "value", 2);
u([
  T({ attribute: !1 })
], o.prototype, "config", 1);
u([
  d()
], o.prototype, "_isEditing", 2);
u([
  d()
], o.prototype, "_allowNull", 2);
u([
  d()
], o.prototype, "_uniqueFilter", 2);
u([
  d()
], o.prototype, "_displayValue", 2);
u([
  d()
], o.prototype, "_languageList", 2);
u([
  d()
], o.prototype, "_languageError", 2);
o = u([
  D("umbraco-language-picker")
], o);
export {
  o as default
};
//# sourceMappingURL=umbraco-language-picker.js.map
