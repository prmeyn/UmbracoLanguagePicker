import { LitElement as h, html as g, css as d, property as i, state as c, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as y } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as N } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as L } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT as E } from "@umbraco-cms/backoffice/property";
import { UmbLanguageCollectionRepository as v } from "@umbraco-cms/backoffice/language";
var _ = Object.defineProperty, b = Object.getOwnPropertyDescriptor, o = (e, t, s, n) => {
  for (var l = n > 1 ? void 0 : n ? b(t, s) : t, r = e.length - 1, u; r >= 0; r--)
    (u = e[r]) && (l = (n ? u(t, s, l) : u(l)) || l);
  return n && l && _(t, s, l), l;
};
let a = class extends N(h) {
  constructor() {
    super(), this.languageList = [], this.currentAlias = "", this.contentParentNode = "", this.languageError = !1, this.mappedLanguageList = {}, this._lowerCaseNone = "", this.isEditing = !1, this.languageCollectionRepository = new v(this), this.consumeContext(L, (e) => {
      this.workspaceContext = e, this.contentNodeId = e.getUnique();
    }), this.consumeContext(f, (e) => {
      this.authorizationContext = e, this.myAuthToken = e.getLatestToken();
    }), this.consumeContext(E, (e) => {
      this.observe(e.alias, async (t) => {
        this.currentAlias = t;
      });
    }), this.consumeContext("UmbMenuStructureWorkspaceContext", (e) => {
      console.log("instance: ", e);
      const t = e.structure.source._value;
      if (t.length !== 2) {
        const s = t.length - 2, n = t[s];
        this.contentParentNode = n ? n.unique : null, console.log(parent);
      } else {
        const s = t[0].unique;
        this.contentParentNode = s;
      }
      console.log(this.contentParentNode), this.observe(e.structure, (s) => {
        console.log(s);
      });
    });
  }
  set config(e) {
    this._allowNull = e.getValueByAlias("allowNull"), this._uniqueFilter = e.getValueByAlias("uniqueFilter");
  }
  async firstUpdated(e) {
    super.firstUpdated(e), console.log(this.value);
    const { data: t } = await this.languageCollectionRepository.requestCollection({});
    this.mappedLanguageList[this._lowerCaseNone] = "NONE", t.items.forEach((s) => {
      this.mappedLanguageList[s.unique.toLowerCase()] = s.name;
    }), console.log(this.mappedLanguageList), this.displayValue = this.mappedLanguageList[this.value || ""], console.log(this.displayValue), this.getLanguages();
  }
  assignToNumber(e) {
    return e ? 1 : 0;
  }
  async getLanguages() {
    try {
      const t = {
        Authorization: `Bearer ${await this.myAuthToken}`
      }, r = (await (await fetch(`/umbraco/management/api/v1/get-key-value-list?parentNodeIdOrGuid=${this.contentParentNode}&nodeIdOrGuid=${this.contentNodeId}&propertyAlias=${this.currentAlias}&uniqueFilter=${this.assignToNumber(this._uniqueFilter)}&allowNull=${this.assignToNumber(this._allowNull)}`, { headers: t })).json()).map((p) => ({ name: this.mappedLanguageList[p.key] || "NONE", value: p.key || this._lowerCaseNone, selected: p.key === this.value })), u = r.find((p) => p.value === this.value);
      this.languageList = r, console.log(this.languageList), u && (this.displayValue = this.mappedLanguageList[u.value]), this.languageError = !1;
    } catch (e) {
      this.languageError = !0, console.log(`An error occured: 
${e}`);
    }
  }
  handleSelectChange(e) {
    const t = e.target.value;
    this.value = t, this._selectedLanguage = t, console.log(t), this.dispatchEvent(new y());
  }
  render() {
    return g`
      ${this.isEditing ? g`<uui-select .value=${this.value} label="select language" .options=${this.languageList} placeholder=${this._allowNull ? "NONE" : "Select an option"} @change=${this.handleSelectChange}></uui-select>` : g`<span class="editing-text">${this.displayValue ? this.displayValue : "Select language"}</span>
          <uui-button look="secondary" color="default" class="data-api-picker-edit-label" role="button" @click=${() => this.isEditing = !this.isEditing}>Edit</uui-button>`}
        ${this.languageError ? g`<p>error when fetching languages</p>` : ""}
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
o([
  i()
], a.prototype, "value", 2);
o([
  i()
], a.prototype, "displayValue", 2);
o([
  i()
], a.prototype, "languageList", 2);
o([
  i()
], a.prototype, "contentNodeId", 2);
o([
  i()
], a.prototype, "myAuthToken", 2);
o([
  i()
], a.prototype, "currentAlias", 2);
o([
  i()
], a.prototype, "contentParentNode", 2);
o([
  i()
], a.prototype, "languageError", 2);
o([
  i()
], a.prototype, "mappedLanguageList", 2);
o([
  i()
], a.prototype, "_lowerCaseNone", 2);
o([
  i({ attribute: !1 })
], a.prototype, "config", 1);
o([
  c()
], a.prototype, "isEditing", 2);
o([
  c()
], a.prototype, "_allowNull", 2);
o([
  c()
], a.prototype, "_uniqueFilter", 2);
o([
  c()
], a.prototype, "_selectedLanguage", 2);
a = o([
  m("umbraco-language-picker")
], a);
export {
  a as default
};
//# sourceMappingURL=umbraco-language-picker.js.map
