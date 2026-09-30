# UmbracoLanguagePicker

A property editor for the Umbraco 14 backoffice. Editors use it to pick one of the languages set up under **Settings → Languages**. The value is saved as the language's ISO code (for example `da-dk`), so you can use it in templates to set a culture, filter content, or build language switchers.

## Features

- A dropdown with every language configured in Umbraco, shown by name.
- **Unique filter** (optional): a language already picked on one sibling node isn't offered on the others. Useful for trees such as one node per market or language.
- **Allow no value** (optional): adds a `NONE` option so the property can be left empty.
- Backoffice text in English and Danish.

## Requirements

- Umbraco CMS 14 (the package is built against `Umbraco.Cms.Web.Website` 14.2.0)
- .NET 8
- [UmbracoKeyValuePropertyEditor](https://www.nuget.org/packages/UmbracoKeyValuePropertyEditor), which is installed automatically as a dependency

## Installation

```bash
dotnet add package UmbracoLanguagePicker
```

Build and run the site. When you build, the package copies its backoffice files into `App_Plugins/LanguagePicker` in your project, and `dotnet clean` removes them again.

## Setup

1. In the backoffice, go to **Settings → Data Types** and create a new Data Type.
2. Choose the **UmbracoLanguagePicker** property editor (flag icon, in the *Common* group).
3. Set the options you need:

   | Setting | Default | What it does |
   | --- | --- | --- |
   | Unique Filter | off | Hides languages already used by this property on sibling nodes. |
   | Allow no value | off | Adds a `NONE` option that saves an empty value. |

4. Add a property using the Data Type to any Document Type.

On existing nodes the picker shows the current language with an **Edit** button. On new nodes it opens as a dropdown straight away.

## Using the value

The value is a lowercase ISO code string, such as `en-us` or `da-dk`. It's an empty string when **Allow no value** is on and `NONE` is picked.

```cshtml
@{
    var languageCode = Model.Value<string>("language");
}

@if (!string.IsNullOrEmpty(languageCode))
{
    var culture = new System.Globalization.CultureInfo(languageCode);
    <p>This page is in @culture.DisplayName</p>
}
```

With ModelsBuilder, the generated property is a `string`.

## How the unique filter works

When **Unique Filter** is on, the picker asks the server which languages the same property already uses on the node's siblings, meaning the other children of the same parent, or the other root nodes for a node at the root. Those languages are left out of the dropdown. The node's own current value is always available.

Limitations:

- Only **published** siblings are checked, because the lookup uses the published content cache. Unpublished drafts don't count.
- The filter only changes which options the dropdown shows. Nothing checks the value when a node is saved, so two editors working at the same time can still pick the same language.
- If the siblings can't be read, the picker shows all languages and logs a warning.

## Development

The backoffice UI is a [Lit](https://lit.dev/) web component in `UmbracoLanguagePicker/App_Plugins/LanguagePicker`, built with Vite.

```bash
cd UmbracoLanguagePicker/App_Plugins/LanguagePicker
npm ci
npm run build     # type-checks and writes dist/
npm run watch     # rebuilds on change
```

Then build the .NET project from the repository root:

```bash
dotnet build
```

Project layout:

| Path | Purpose |
| --- | --- |
| `App_Plugins/LanguagePicker/src/` | The property editor web component (TypeScript) |
| `App_Plugins/LanguagePicker/umbraco-package.json` | Registers the property editor, its settings and translations |
| `App_Plugins/LanguagePicker/Localization/` | Backoffice translations (`en`, `en-us`, `da-dk`) |
| `LanguageApiController.cs` | Management API endpoint (`GET /umbraco/management/api/v1/get-key-value-list`) that returns the available language codes |
| `UmbracoLanguagePickerConverter.cs` | Property value converter, which returns the value as a `string` |
| `build/UmbracoLanguagePicker.targets` | Copies the backoffice files into the consuming site on build |

### Releasing

Pushing a tag of the form `vX.Y.Z` from a commit on `main` runs the GitHub Actions workflow. It builds the client files, packs the NuGet package with version `X.Y.Z`, and publishes it to nuget.org.

## License

[MIT](LICENSE)
