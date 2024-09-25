import { LitElement as g, html as h, css as d, property as i, state as c, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as y } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as f } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as L } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT as N } from "@umbraco-cms/backoffice/property";
import { UmbLanguageCollectionRepository as _ } from "@umbraco-cms/backoffice/language";
var v = Object.defineProperty, C = Object.getOwnPropertyDescriptor, s = (e, t, n, r) => {
  for (var o = r > 1 ? void 0 : r ? C(t, n) : t, l = e.length - 1, u; l >= 0; l--)
    (u = e[l]) && (o = (r ? u(t, n, o) : u(o)) || o);
  return r && o && v(t, n, o), o;
};
let a = class extends E(g) {
  constructor() {
    super(), this.languageList = [], this.currentAlias = "", this.contentParentNode = "", this.languageError = !1, this.mappedLanguageList = {}, this._lowerCaseNone = "", this.isEditing = !1, this.languageCollectionRepository = new _(this), this.consumeContext(f, (e) => {
      this.workspaceContext = e, this.contentNodeId = e.getUnique();
    }), this.consumeContext(L, (e) => {
      this.authorizationContext = e, this.myAuthToken = e.getLatestToken();
    }), this.consumeContext(N, (e) => {
      this.observe(e.alias, async (t) => {
        this.currentAlias = t;
      });
    }), this.consumeContext("UmbMenuStructureWorkspaceContext", (e) => {
      const t = e.structure.source._value, n = t.length - 2, r = t[n];
      this.contentParentNode = r ? r.unique : null, this.observe(e.structure, (o) => {
        console.log(o);
      });
    });
  }
  set config(e) {
    this._allowNull = e.getValueByAlias("allowNull"), this._uniqueFilter = e.getValueByAlias("uniqueFilter");
  }
  async firstUpdated(e) {
    super.firstUpdated(e);
    const { data: t } = await this.languageCollectionRepository.requestCollection({});
    this.mappedLanguageList[this._lowerCaseNone] = "NONE", t == null || t.items.forEach((n) => {
      this.mappedLanguageList[n.unique.toLowerCase()] = n.name;
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
    this.value = t, this._selectedLanguage = t, this.dispatchEvent(new y());
  }
  render() {
    return h`
      ${this.isEditing ? h`<uui-select .value=${this.value} label="select language" .options=${this.languageList} placeholder=${this._allowNull ? "NONE" : "Select an option"} @change=${this.handleSelectChange}></uui-select>` : h`<span class="editing-text">${this.displayValue ? this.displayValue : "Select language"}</span>
          <uui-button look="secondary" color="default" class="data-api-picker-edit-label" role="button" @click=${() => this.isEditing = !this.isEditing}>Edit</uui-button>`}
        ${this.languageError ? h`<p>error when fetching languages</p>` : ""}
    `;
  }
};
a.styles = [
  d`
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
  i()
], a.prototype, "value", 2);
s([
  i()
], a.prototype, "displayValue", 2);
s([
  i()
], a.prototype, "languageList", 2);
s([
  i()
], a.prototype, "contentNodeId", 2);
s([
  i()
], a.prototype, "myAuthToken", 2);
s([
  i()
], a.prototype, "currentAlias", 2);
s([
  i()
], a.prototype, "contentParentNode", 2);
s([
  i()
], a.prototype, "languageError", 2);
s([
  i()
], a.prototype, "mappedLanguageList", 2);
s([
  i()
], a.prototype, "_lowerCaseNone", 2);
s([
  i({ attribute: !1 })
], a.prototype, "config", 1);
s([
  c()
], a.prototype, "isEditing", 2);
s([
  c()
], a.prototype, "_allowNull", 2);
s([
  c()
], a.prototype, "_uniqueFilter", 2);
s([
  c()
], a.prototype, "_selectedLanguage", 2);
a = s([
  m("umbraco-language-picker")
], a);
export {
  a as default
};
//# sourceMappingURL=umbraco-language-picker.js.map
