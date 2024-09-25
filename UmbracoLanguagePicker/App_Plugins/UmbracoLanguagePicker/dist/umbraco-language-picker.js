import { LitElement as E, html as d, css as w, property as n, state as m, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as L } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as O } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT as P } from "@umbraco-cms/backoffice/property";
import { UmbLanguageCollectionRepository as $ } from "@umbraco-cms/backoffice/language";
var b = Object.defineProperty, x = Object.getOwnPropertyDescriptor, s = (e, t, a, o) => {
  for (var r = o > 1 ? void 0 : o ? x(t, a) : t, l = e.length - 1, u; l >= 0; l--)
    (u = e[l]) && (r = (o ? u(t, a, r) : u(r)) || r);
  return o && r && b(t, a, r), r;
}, f = (e, t, a) => {
  if (!t.has(e))
    throw TypeError("Cannot " + a);
}, g = (e, t, a) => (f(e, t, "read from private field"), a ? a.call(e) : t.get(e)), y = (e, t, a) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, _ = (e, t, a, o) => (f(e, t, "write to private field"), o ? o.call(e, a) : t.set(e, a), a), A = (e, t, a) => (f(e, t, "access private method"), a), h, c, v, N;
let i = class extends k(E) {
  constructor() {
    super(), y(this, v), this.languageList = [], this.currentAlias = "", this.contentParentNode = "", this.languageError = !1, this.mappedLanguageList = {}, this._lowerCaseNone = "", this.isEditing = !1, this.languageCollectionRepository = new $(this), y(this, h, void 0), y(this, c, void 0), this.consumeContext(O, (e) => {
      _(this, h, e), this.contentNodeId = e.getUnique();
    }), this.consumeContext(T, (e) => {
      this.authorizationContext = e, this.myAuthToken = e.getLatestToken();
    }), this.consumeContext(P, (e) => {
      this.observe(e.alias, async (t) => {
        this.currentAlias = t;
      });
    }), this.consumeContext("UmbMenuStructureWorkspaceContext", (e) => {
      _(this, c, e), A(this, v, N).call(this);
    });
  }
  set config(e) {
    this._allowNull = e.getValueByAlias("allowNull"), this._uniqueFilter = e.getValueByAlias("uniqueFilter");
  }
  isDocumentRoot() {
    return location.href.split("/").indexOf("document-root") > -1;
  }
  async firstUpdated(e) {
    super.firstUpdated(e);
    const { data: t } = await this.languageCollectionRepository.requestCollection({});
    this.mappedLanguageList[this._lowerCaseNone] = "NONE", t == null || t.items.forEach((a) => {
      this.mappedLanguageList[a.unique.toLowerCase()] = a.name;
    }), this.displayValue = this.mappedLanguageList[this.value || ""], this.getLanguages();
  }
  async getLanguages() {
    try {
      const t = {
        Authorization: `Bearer ${await this.myAuthToken}`
      }, l = (await (await fetch(`/umbraco/management/api/v1/get-key-value-list?parentNodeIdOrGuid=${this.contentParentNode}&nodeIdOrGuid=${this.contentNodeId}&propertyAlias=${this.currentAlias}&uniqueFilter=${!!this._uniqueFilter}&allowNull=${!!this._allowNull}`, { headers: t })).json()).map((p) => ({ name: this.mappedLanguageList[p.key] || "NONE", value: p.key || this._lowerCaseNone, selected: p.key === this.value })), u = l.find((p) => p.value === this.value);
      this.languageList = l, u && (this.displayValue = this.mappedLanguageList[u.value]), this.languageError = !1;
    } catch (e) {
      this.languageError = !0, console.error(e);
    }
  }
  handleSelectChange(e) {
    const t = e.target.value;
    this.value = t, this._selectedLanguage = t, this.dispatchEvent(new L());
  }
  render() {
    return d`
      ${this.isEditing ? d`<uui-select .value=${this.value} label="select language" .options=${this.languageList} placeholder=${this._allowNull ? "NONE" : "Select an option"} @change=${this.handleSelectChange}></uui-select>` : d`<span class="editing-text">${this.displayValue ? this.displayValue : "Select language"}</span>
          <uui-button look="secondary" color="default" class="data-api-picker-edit-label" role="button" @click=${() => this.isEditing = !this.isEditing}>Edit</uui-button>`}
        ${this.languageError ? d`<p>error when fetching languages</p>` : ""}
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakSet();
N = function() {
  if (!g(this, c) || !g(this, h))
    return;
  const e = g(this, h).getIsNew();
  this.observe(
    g(this, c).structure,
    (t) => {
      var o, r;
      const a = t;
      e ? this.isDocumentRoot() ? this.contentParentNode = null : this.contentParentNode = (o = a[a.length - 1]) == null ? void 0 : o.unique : this.contentParentNode = (r = a[a.length - 2]) == null ? void 0 : r.unique;
    },
    "menuStructureObserver"
  );
};
i.styles = [
  w`
      .data-api-picker-edit-label {
        font-size: 13px;
      }
      .data-api-picker-edit-label:hover {
        color: #515054;
      }
      
      .editing-text {
        padding-right: 12px;
      }
    `
];
s([
  n()
], i.prototype, "value", 2);
s([
  n()
], i.prototype, "displayValue", 2);
s([
  n()
], i.prototype, "languageList", 2);
s([
  n()
], i.prototype, "contentNodeId", 2);
s([
  n()
], i.prototype, "myAuthToken", 2);
s([
  n()
], i.prototype, "currentAlias", 2);
s([
  n()
], i.prototype, "contentParentNode", 2);
s([
  n()
], i.prototype, "languageError", 2);
s([
  n()
], i.prototype, "mappedLanguageList", 2);
s([
  n()
], i.prototype, "_lowerCaseNone", 2);
s([
  n({ attribute: !1 })
], i.prototype, "config", 1);
s([
  m()
], i.prototype, "isEditing", 2);
s([
  m()
], i.prototype, "_allowNull", 2);
s([
  m()
], i.prototype, "_uniqueFilter", 2);
s([
  m()
], i.prototype, "_selectedLanguage", 2);
i = s([
  C("umbraco-language-picker")
], i);
export {
  i as default
};
//# sourceMappingURL=umbraco-language-picker.js.map
