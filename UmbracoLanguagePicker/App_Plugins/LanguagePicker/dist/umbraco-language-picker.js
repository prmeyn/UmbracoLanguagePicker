import { LitElement as $, html as k, css as V, property as W, state as v, customElement as A } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as B } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as F } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as D } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as I } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT as R } from "@umbraco-cms/backoffice/property";
import { UMB_PARENT_ENTITY_CONTEXT as z } from "@umbraco-cms/backoffice/entity";
import { UmbLanguageCollectionRepository as X } from "@umbraco-cms/backoffice/language";
var G = Object.defineProperty, Y = Object.getOwnPropertyDescriptor, u = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Y(e, i) : e, h = t.length - 1, w; h >= 0; h--)
    (w = t[h]) && (r = (s ? w(e, i, r) : w(r)) || r);
  return s && r && G(e, i, r), r;
}, U = (t, e, i) => {
  if (!e.has(t))
    throw TypeError("Cannot " + i);
}, a = (t, e, i) => (U(t, e, "read from private field"), i ? i.call(t) : e.get(t)), n = (t, e, i) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, i);
}, c = (t, e, i, s) => (U(t, e, "write to private field"), s ? s.call(t, i) : e.set(t, i), i), H = (t, e, i, s) => ({
  set _(r) {
    c(t, e, r, i);
  },
  get _() {
    return a(t, e, s);
  }
}), o = (t, e, i) => (U(t, e, "access private method"), i), g, L, E, y, f, p, _, P, b, q, M, N, T, d, m;
const K = "NONE";
let l = class extends F($) {
  constructor() {
    super(), n(this, P), n(this, q), n(this, N), n(this, d), this._isEditing = !1, this._languageList = [], this._languageError = !1, n(this, g, void 0), n(this, L, !1), n(this, E, void 0), n(this, y, void 0), n(this, f, void 0), n(this, p, void 0), n(this, _, 0), this.consumeContext(D, (t) => {
      var e, i;
      t && (c(this, g, t), c(this, E, a(this, g).getUnique()), (i = (e = a(this, g)).getIsNew) != null && i.call(e) && (this._isEditing = !0), o(this, d, m).call(this));
    }), this.consumeContext(R, (t) => {
      t && this.observe(t.alias, (e) => {
        c(this, y, e), o(this, d, m).call(this);
      });
    }), this.consumeContext(z, (t) => {
      c(this, L, !!t), t && this.observe(t.parent, (e) => {
        e && o(this, P, b).call(this, e.unique);
      }, "parentObserver");
    });
  }
  set config(t) {
    this._allowNull = t.getValueByAlias("allowNull"), this._uniqueFilter = t.getValueByAlias("uniqueFilter");
  }
  firstUpdated(t) {
    super.firstUpdated(t), o(this, d, m).call(this);
  }
  async handleSelectChange(t) {
    this.value = t.target.value, this.dispatchEvent(new B()), a(this, p) && (this._displayValue = o(this, N, T).call(this, await a(this, p), this.value));
  }
  renderDropdown() {
    return k`
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
    return k`
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
    return k`
      ${this._isEditing ? this.renderDropdown() : this.renderDisplayValue()}
      ${this._languageError ? k`<p class="error-text">Error fetching languages</p>` : ""}
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
L = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakSet();
b = function(t) {
  t === void 0 || t === a(this, f) || (c(this, f, t), o(this, d, m).call(this));
};
q = /* @__PURE__ */ new WeakSet();
M = async function() {
  const { data: t } = await new X(this).requestCollection({}), e = {};
  return t == null || t.items.forEach((i) => {
    e[i.unique.toLowerCase()] = i.name;
  }), e;
};
N = /* @__PURE__ */ new WeakSet();
T = function(t, e) {
  return e ? t[e] ?? e : this._allowNull ? K : "";
};
d = /* @__PURE__ */ new WeakSet();
m = async function() {
  const t = !!a(this, g) && !a(this, E), e = a(this, L) && a(this, f) === void 0;
  if (this._uniqueFilter && (!a(this, y) || t || e) || !this._uniqueFilter && a(this, _) > 0)
    return;
  const i = ++H(this, _)._;
  try {
    a(this, p) ?? c(this, p, o(this, q, M).call(this));
    const s = await a(this, p), r = await this.getContext(I);
    if (!r)
      throw new Error("The auth context is not available");
    const h = r.getOpenApiConfiguration(), w = new URLSearchParams({
      parentNodeIdOrGuid: a(this, f) ?? "",
      nodeIdOrGuid: a(this, E) ?? "",
      propertyAlias: a(this, y) ?? "",
      uniqueFilter: String(!!this._uniqueFilter),
      allowNull: String(!!this._allowNull)
    }), C = await fetch(`${h.base ?? ""}/umbraco/management/api/v1/umbraco-language-picker/languages?${w}`, {
      credentials: h.credentials,
      headers: { Authorization: `Bearer ${await h.token()}` }
    });
    if (!C.ok)
      throw new Error(`Fetching languages failed: ${C.status} ${C.statusText}`);
    const S = await C.json();
    if (i !== a(this, _))
      return;
    const x = this.value ?? "";
    this._languageList = S.map(({ key: O }) => ({
      name: o(this, N, T).call(this, s, O),
      value: O,
      selected: O === x
    })), this._displayValue = o(this, N, T).call(this, s, x), this._languageError = !1;
  } catch (s) {
    if (i !== a(this, _))
      return;
    this._languageError = !0, console.error(s);
  }
};
l.styles = [
  V`
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
  W()
], l.prototype, "value", 2);
u([
  W({ attribute: !1 })
], l.prototype, "config", 1);
u([
  v()
], l.prototype, "_isEditing", 2);
u([
  v()
], l.prototype, "_allowNull", 2);
u([
  v()
], l.prototype, "_uniqueFilter", 2);
u([
  v()
], l.prototype, "_displayValue", 2);
u([
  v()
], l.prototype, "_languageList", 2);
u([
  v()
], l.prototype, "_languageError", 2);
l = u([
  A("umbraco-language-picker")
], l);
export {
  l as default
};
//# sourceMappingURL=umbraco-language-picker.js.map
