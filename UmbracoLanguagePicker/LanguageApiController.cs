using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Extensions;
using UmbracoKeyValuePropertyEditor;

namespace UmbracoLanguagePicker
{

	[PluginController("UmbracoLanguagePicker")]
	public sealed class LanguageApiController : KeyValueUmbracoPropertyEditorController
	{
		private readonly UmbracoHelper _umbracoHelper;
		private readonly ILocalizationService _localizationService;

		public LanguageApiController(UmbracoHelper umbracoHelper, ILocalizationService localizationService)
		{
			_umbracoHelper = umbracoHelper;
			_localizationService = localizationService;
		}

		public override IOrderedEnumerable<KeyValuePair<string, string>> GetKeyValueList(int nodeId, string propertyAlias, int uniqueFilter = 0, int allowNull = 0)
		{
			try
			{
				string[] usedUpLanguageCodes = Array.Empty<string>();
				try
				{
					var parent = _umbracoHelper.Content(nodeId).Parent;
					usedUpLanguageCodes = (parent == null ? _umbracoHelper.Content(nodeId).Children.Where(c => c.Id != nodeId).Select(c => c.Value<string>(propertyAlias)?.ToLowerInvariant()) : parent.Children.Where(c => c.Id != nodeId).Select(c => c.Value<string>(propertyAlias)?.ToLowerInvariant()).Union(_umbracoHelper.Content(nodeId).Children.Where(c => c.Id != nodeId).Select(c => c.Value<string>(propertyAlias)?.ToLowerInvariant()))).ToArray();
				}
				catch { uniqueFilter = 0; }
				LanguageDTO[] languageList = null;
				if (uniqueFilter == 1)
				{
					languageList = (new LanguageApiWrapper(_localizationService)).AllLanguages.Where(c => !usedUpLanguageCodes.Contains(c.ISOCode.ToLowerInvariant())).ToArray();
				}
				else
				{
					languageList = (new LanguageApiWrapper(_localizationService)).AllLanguages.ToArray();
				}
				if (allowNull == 1)
				{
					languageList = languageList.Prepend(new LanguageDTO { ISOCode = "", EnglishName = "NONE" }).ToArray();
				}
				return languageList.ToDictionary(c => c.ISOCode.ToLowerInvariant(), c => c.EnglishName).OrderBy(v => v.Key);
			}
			catch
			{
				return null;
			}
		}
	}
}
