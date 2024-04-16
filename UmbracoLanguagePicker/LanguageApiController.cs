using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Core.Models.PublishedContent;
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

		public override IOrderedEnumerable<KeyValuePair<string, string>> GetKeyValueList(string nodeIdStr, string propertyAlias, int uniqueFilter = 0, int allowNull = 0)
		{
			try
			{
				string[] usedUpLanguageCodes = Array.Empty<string>();
				try
				{
                    var nodeId = int.Parse(nodeIdStr);
                    var currentNode = _umbracoHelper.Content(nodeId);
					if (currentNode != null)
					{
                        var parent = currentNode.Parent;
                        usedUpLanguageCodes = (parent == null ? GetValuesOfChildrensProperty(currentNode, propertyAlias, nodeId) : GetValuesOfChildrensProperty(parent, propertyAlias, nodeId).Union(GetValuesOfChildrensProperty(currentNode, propertyAlias, nodeId))).ToArray();
                    }
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

        private IEnumerable<string> GetValuesOfChildrensProperty(IPublishedContent node, string propertyAlias, int nodeId)
        {
			return node.Children.Where(c => c.Id != nodeId).Select(c => c.Value<string>(propertyAlias)?.ToLowerInvariant());
        }
    }
}
