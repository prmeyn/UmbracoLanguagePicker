import { LitElement, html, css, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent } from "@umbraco-cms/backoffice/property-editor";
// Needed for language picker config values 'allowNull' and 'uniqueFilter'
import type { UmbPropertyEditorConfigCollection, UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_PARENT_ENTITY_CONTEXT } from '@umbraco-cms/backoffice/entity';
import { UmbLanguageCollectionRepository } from "@umbraco-cms/backoffice/language";
import type { UUISelectEvent } from "@umbraco-cms/backoffice/external/uui";
import type { CSSResult } from "@umbraco-cms/backoffice/external/lit";

const NONE_LABEL = "NONE";

// The parts of the workspace context this editor uses. Not every workspace has getIsNew.
type PickerWorkspaceContext = {
  getUnique(): string | null | undefined;
  getIsNew?(): boolean | undefined;
};

type LanguageOption = { name: string; value: string; selected: boolean };

@customElement('umbraco-language-picker')
export default class UmbracoLanguagePickerElement extends UmbElementMixin(LitElement) implements UmbPropertyEditorUiElement
{
  @property()
  public value?: string;

  @property({attribute: false})
  public set config(config: UmbPropertyEditorConfigCollection) {
    this._allowNull = config.getValueByAlias("allowNull");
    this._uniqueFilter = config.getValueByAlias("uniqueFilter");
  }

  @state()
  private _isEditing: boolean = false;

  @state()
  private _allowNull?: boolean;

  @state()
  private _uniqueFilter?: boolean;

  @state()
  private _displayValue?: string;

  @state()
  private _languageList: LanguageOption[] = [];

  @state()
  private _languageError: boolean = false;

  #workspaceContext?: PickerWorkspaceContext;
  #hasParentContext = false;
  #nodeUnique?: string | null;
  #propertyAlias?: string;
  // null means the content root; undefined means not known yet.
  #parentUnique?: string | null;
  #languageNames?: Promise<Record<string, string>>;
  #requestId = 0;

  constructor() {
    super();
    this.consumeContext(UMB_WORKSPACE_CONTEXT, (context) => {
      if (!context) return;
      this.#workspaceContext = context as unknown as PickerWorkspaceContext;
      //grab the node id (guid) from the context
      this.#nodeUnique = this.#workspaceContext.getUnique();
      if (this.#workspaceContext.getIsNew?.()) this._isEditing = true;
      this.#loadLanguages();
    });
    // To get the alias of the UmbracoLanguagePicker property editor you need to use this
    this.consumeContext(UMB_PROPERTY_CONTEXT, (propertyContext) => {
      if (!propertyContext) return;
      this.observe(propertyContext.alias, (propertyAlias) => {
        this.#propertyAlias = propertyAlias;
        this.#loadLanguages();
      });
    });
    // The parent entity is known both when creating and when editing. The content root has a null unique.
    this.consumeContext(UMB_PARENT_ENTITY_CONTEXT, (parentContext) => {
      this.#hasParentContext = !!parentContext;
      if (!parentContext) return;
      this.observe(parentContext.parent, (parent) => {
        if (parent) this.#setParent(parent.unique);
      }, 'parentObserver');
    });
  }

  #setParent(unique: string | null | undefined) {
    if (unique === undefined || unique === this.#parentUnique) return;
    this.#parentUnique = unique;
    this.#loadLanguages();
  }

  firstUpdated(changed: Map<PropertyKey, unknown>): void {
    super.firstUpdated(changed);
    this.#loadLanguages();
  }

  async #getBackofficeLanguages(): Promise<Record<string, string>> {
    const { data } = await new UmbLanguageCollectionRepository(this).requestCollection({});
    const names: Record<string, string> = {};
    data?.items.forEach(element => {
      names[element.unique.toLowerCase()] = element.name;
    });
    return names;
  }

  #getDisplayName(names: Record<string, string>, key: string): string {
    if (!key) return this._allowNull ? NONE_LABEL : "";
    return names[key] ?? key;
  }

  // Called whenever one of the inputs changes. Newer calls make older responses be ignored.
  async #loadLanguages(): Promise<void> {
    // The unique filter needs to know which property, node and parent this is before it can exclude used languages.
    // Places without a workspace or parent context (e.g. some block editors) never get those, so don't wait there.
    const waitForNode = !!this.#workspaceContext && !this.#nodeUnique;
    const waitForParent = this.#hasParentContext && this.#parentUnique === undefined;
    if (this._uniqueFilter && (!this.#propertyAlias || waitForNode || waitForParent)) return;
    // Without the unique filter the list never depends on those inputs, so one request is enough.
    if (!this._uniqueFilter && this.#requestId > 0) return;

    const requestId = ++this.#requestId;
    try {
      this.#languageNames ??= this.#getBackofficeLanguages();
      const names = await this.#languageNames;

      const authContext = await this.getContext(UMB_AUTH_CONTEXT);
      if (!authContext) throw new Error("The auth context is not available");
      // The backoffice uses cookie auth; this is Umbraco's documented way to call your own Management API endpoints.
      const config = authContext.getOpenApiConfiguration();
      const query = new URLSearchParams({
        parentNodeIdOrGuid: this.#parentUnique ?? "",
        nodeIdOrGuid: this.#nodeUnique ?? "",
        propertyAlias: this.#propertyAlias ?? "",
        uniqueFilter: String(!!this._uniqueFilter),
        allowNull: String(!!this._allowNull),
      });
      const response = await fetch(`${config.base ?? ""}/umbraco/management/api/v1/umbraco-language-picker/languages?${query}`, {
        credentials: config.credentials,
        headers: { Authorization: `Bearer ${await config.token()}` }
      });
      if (!response.ok) throw new Error(`Fetching languages failed: ${response.status} ${response.statusText}`);
      const languages: Array<{ key: string }> = await response.json();
      if (requestId !== this.#requestId) return;

      const currentValue = this.value ?? "";
      // Need to map it so the uui element can accept and display the data: https://uui.umbraco.com/?path=/docs/uui-select--docs
      this._languageList = languages.map(({ key }) => ({
        name: this.#getDisplayName(names, key),
        value: key,
        selected: key === currentValue,
      }));
      this._displayValue = this.#getDisplayName(names, currentValue);
      this._languageError = false;
    } catch (error) {
      if (requestId !== this.#requestId) return;
      this._languageError = true;
      console.error(error);
    }
  }

  private async handleSelectChange(e: UUISelectEvent): Promise<void> {
    this.value = e.target.value as string;
    this.dispatchEvent(new UmbPropertyValueChangeEvent());
    if (this.#languageNames) {
      this._displayValue = this.#getDisplayName(await this.#languageNames, this.value);
    }
  }

  private renderDropdown() {
    return html`
      <uui-select
          .value=${this.value ?? ""}
          label="Select Language"
          .options=${this._languageList}
          .placeholder=${this._displayValue ?? ""}
          @change=${this.handleSelectChange}
      ></uui-select>
    `
  }

  private renderDisplayValue() {
    return html`
      <span class="editing-text">
      ${this._displayValue ? this._displayValue : this.value}
    </span>
      <uui-button
          look="secondary"
          color="default"
          class="data-api-picker-edit-label"
          role="button"
          @click=${() => (this._isEditing = !this._isEditing)}>
        <umb-localize key="umbracoLanguagePicker_edit">Edit</umb-localize>
      </uui-button>
    `;
  }


  render() {
    return html`
      ${this._isEditing
          ? this.renderDropdown()
          : this.renderDisplayValue()}
      ${this._languageError ? html`<p class="error-text">Error fetching languages</p>` : ""}
    `;
  }

  static styles: CSSResult[] = [
    css`
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

}

declare global {
  interface HTMLElementTagNameMap {
    'umbraco-language-picker': UmbracoLanguagePickerElement;
  }
}
