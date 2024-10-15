import { LitElement as w, html as c, css as N, property as n, state as m, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as C } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as k } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as b } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as P } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT as O } from "@umbraco-cms/backoffice/property";
import { UmbLanguageCollectionRepository as x } from "@umbraco-cms/backoffice/language";
var T = Object.defineProperty, A = Object.getOwnPropertyDescriptor, o = (e, t, a, s) => {
  for (var r = s > 1 ? void 0 : s ? A(t, a) : t, l = e.length - 1, u; l >= 0; l--)
    (u = e[l]) && (r = (s ? u(t, a, r) : u(r)) || r);
  return s && r && T(t, a, r), r;
}, v = (e, t, a) => {
  if (!t.has(e))
    throw TypeError("Cannot " + a);
}, d = (e, t, a) => (v(e, t, "read from private field"), a ? a.call(e) : t.get(e)), y = (e, t, a) => {
  if (t.has(e))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, _ = (e, t, a, s) => (v(e, t, "write to private field"), s ? s.call(e, a) : t.set(e, a), a), $ = (e, t, a) => (v(e, t, "access private method"), a), h, g, f, L;
let i = class extends k(w) {
  constructor() {
    super(), y(this, f), this.languageList = [], this.currentAlias = "", this.contentParentNode = "", this.languageError = !1, this.mappedLanguageList = {}, this._lowerCaseNone = "", this.isEditing = !1, this.languageCollectionRepository = new x(this), y(this, h, void 0), y(this, g, void 0), this.consumeContext(b, (e) => {
      _(this, h, e), this.contentNodeId = e.getUnique();
    }), this.consumeContext(P, (e) => {
      this.authorizationContext = e, this.myAuthToken = e.getLatestToken();
    }), this.consumeContext(O, (e) => {
      this.observe(e.alias, async (t) => {
        this.currentAlias = t;
      });
    }), this.consumeContext("UmbMenuStructureWorkspaceContext", (e) => {
      _(this, g, e), $(this, f, L).call(this);
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
    const { data: e } = await this.languageCollectionRepository.requestCollection({});
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
    this.value = t, this._selectedLanguage = t, this.dispatchEvent(new C());
  }
  render() {
    return c`
      ${this.isEditing ? c`
            <uui-select .value=${this.value} label="select language" .options=${this.languageList} .placeholder=${this._allowNull ? "NONE" : c`<umb-localize key="umbracoLanguagePicker_selectAnOption">Select an option</umb-localize>`} @change=${this.handleSelectChange}>
            </uui-select>` : c`
            <span class="editing-text">
              ${this.value ? this.displayValue : c`<umb-localize key="umbracoLanguagePicker_selectLanguage">Select Language</umb-localize>`}
            </span>
          <uui-button look="secondary" color="default" class="data-api-picker-edit-label" role="button" @click=${() => this.isEditing = !this.isEditing}>
            <umb-localize key="umbracoLanguagePicker_edit">
              Edit
            </umb-localize>
          </uui-button>`}
      ${this.languageError ? c`<p class="error-text">error when fetching languages</p>` : ""}
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakSet();
L = function() {
  if (!d(this, g) || !d(this, h))
    return;
  const e = d(this, h).getIsNew();
  this.observe(
    d(this, g).structure,
    (t) => {
      var s, r;
      const a = t;
      e ? this.isDocumentRoot() ? this.contentParentNode = null : this.contentParentNode = (s = a[a.length - 1]) == null ? void 0 : s.unique : this.contentParentNode = (r = a[a.length - 2]) == null ? void 0 : r.unique;
    },
    "menuStructureObserver"
  );
};
i.styles = [
  N`
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
o([
  n()
], i.prototype, "value", 2);
o([
  n()
], i.prototype, "displayValue", 2);
o([
  n()
], i.prototype, "languageList", 2);
o([
  n()
], i.prototype, "contentNodeId", 2);
o([
  n()
], i.prototype, "myAuthToken", 2);
o([
  n()
], i.prototype, "currentAlias", 2);
o([
  n()
], i.prototype, "contentParentNode", 2);
o([
  n()
], i.prototype, "languageError", 2);
o([
  n()
], i.prototype, "mappedLanguageList", 2);
o([
  n()
], i.prototype, "_lowerCaseNone", 2);
o([
  n({ attribute: !1 })
], i.prototype, "config", 1);
o([
  m()
], i.prototype, "isEditing", 2);
o([
  m()
], i.prototype, "_allowNull", 2);
o([
  m()
], i.prototype, "_uniqueFilter", 2);
o([
  m()
], i.prototype, "_selectedLanguage", 2);
i = o([
  E("umbraco-language-picker")
], i);
export {
  i as default
};
//# sourceMappingURL=umbraco-language-picker.js.map
