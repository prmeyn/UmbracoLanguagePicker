import { LitElement as E, html as d, css as L, property as n, state as _, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as N } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as b } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT as P } from "@umbraco-cms/backoffice/property";
import { UmbLanguageCollectionRepository as T } from "@umbraco-cms/backoffice/language";
var O = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, r = (e, t, a, s) => {
  for (var o = s > 1 ? void 0 : s ? $(t, a) : t, l = e.length - 1, u; l >= 0; l--)
    (u = e[l]) && (o = (s ? u(t, a, o) : u(o)) || o);
  return s && o && O(t, a, o), o;
}, f = (e, t, a) => {
  if (!t.has(e))
    throw TypeError("Cannot " + a);
}, g = (e, t, a) => (f(e, t, "read from private field"), a ? a.call(e) : t.get(e)), m = (e, t, a) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, v = (e, t, a, s) => (f(e, t, "write to private field"), s ? s.call(e, a) : t.set(e, a), a), A = (e, t, a) => (f(e, t, "access private method"), a), h, c, y, w;
let i = class extends k(E) {
  constructor() {
    super(), m(this, y), this.languageList = [], this.currentAlias = "", this.contentParentNode = "", this.languageError = !1, this.mappedLanguageList = {}, this._lowerCaseNone = "", this._isEditing = !1, this._languageCollectionRepository = new T(this), m(this, h, void 0), m(this, c, void 0), this.consumeContext(b, (e) => {
      v(this, h, e), this.contentNodeId = e.getUnique();
    }), this.consumeContext(x, (e) => {
      this._authorizationContext = e, this.myAuthToken = e.getLatestToken();
    }), this.consumeContext(P, (e) => {
      this.observe(e.alias, async (t) => {
        this.currentAlias = t;
      });
    }), this.consumeContext("UmbMenuStructureWorkspaceContext", (e) => {
      v(this, c, e), A(this, y, w).call(this);
    });
  }
  set config(e) {
    this._allowNull = e.getValueByAlias("allowNull"), this._uniqueFilter = e.getValueByAlias("uniqueFilter");
  }
  isDocumentRoot() {
    return location.href.split("/").indexOf("document-root") > -1;
  }
  async firstUpdated(e) {
    super.firstUpdated(e), await this.getBackofficeLanguages(), await this.getLanguages();
  }
  async getBackofficeLanguages() {
    const { data: e } = await this._languageCollectionRepository.requestCollection({});
    this.mappedLanguageList[this._lowerCaseNone] = "NONE", e == null || e.items.forEach((t) => {
      this.mappedLanguageList[t.unique.toLowerCase()] = t.name;
    }), this.displayValue = this.mappedLanguageList[this.value || ""];
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
    this.value = t, this.dispatchEvent(new N());
  }
  renderDropdown() {
    return d`
      <uui-select
          .value=${this.value}
          label="Select Language"
          .options=${this.languageList}
          .placeholder=${this.displayValue}
          @change=${this.handleSelectChange}
      ></uui-select>
    `;
  }
  renderDisplayValue() {
    return d`
    <span class="editing-text">
      ${this.displayValue ? this.displayValue : this.value}
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
    return d`
    ${this._isEditing ? this.renderDropdown() : this.renderDisplayValue()}
    ${this.languageError ? d`<p class="error-text">Error fetching languages</p>` : ""}
  `;
  }
};
h = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakSet();
w = function() {
  if (!g(this, c) || !g(this, h))
    return;
  const e = g(this, h).getIsNew();
  this.observe(
    g(this, c).structure,
    (t) => {
      var s, o;
      const a = t;
      e ? (this._isEditing = !0, this.isDocumentRoot() ? this.contentParentNode = null : this.contentParentNode = (s = a[a.length - 1]) == null ? void 0 : s.unique) : this.contentParentNode = (o = a[a.length - 2]) == null ? void 0 : o.unique;
    },
    "menuStructureObserver"
  );
};
i.styles = [
  L`
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
r([
  n()
], i.prototype, "value", 2);
r([
  n()
], i.prototype, "displayValue", 2);
r([
  n()
], i.prototype, "languageList", 2);
r([
  n()
], i.prototype, "contentNodeId", 2);
r([
  n()
], i.prototype, "myAuthToken", 2);
r([
  n()
], i.prototype, "currentAlias", 2);
r([
  n()
], i.prototype, "contentParentNode", 2);
r([
  n()
], i.prototype, "languageError", 2);
r([
  n()
], i.prototype, "mappedLanguageList", 2);
r([
  n()
], i.prototype, "_lowerCaseNone", 2);
r([
  n({ attribute: !1 })
], i.prototype, "config", 1);
r([
  _()
], i.prototype, "_isEditing", 2);
r([
  _()
], i.prototype, "_allowNull", 2);
r([
  _()
], i.prototype, "_uniqueFilter", 2);
i = r([
  C("umbraco-language-picker")
], i);
export {
  i as default
};
//# sourceMappingURL=umbraco-language-picker.js.map
