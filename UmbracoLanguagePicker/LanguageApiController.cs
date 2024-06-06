using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common;
using Umbraco.Extensions;
using UmbracoKeyValuePropertyEditor;

namespace UmbracoLanguagePicker
{

    // [PluginController("UmbracoLanguagePicker")]
    [VersionedApiBackOfficeRoute("")]
    [ApiExplorerSettings(GroupName = "UmbracoLanguagePicker")]
    public sealed class LanguageApiController : KeyValueUmbracoPropertyEditorController
    {
        private readonly UmbracoHelper _umbracoHelper;
        private readonly ILocalizationService _localizationService;

        public LanguageApiController(UmbracoHelper umbracoHelper, ILocalizationService localizationService)
        {
            _umbracoHelper = umbracoHelper;
            _localizationService = localizationService;
        }
        
        [HttpGet("get-key-value-list")]
        public override IOrderedEnumerable<KeyValuePair<string, string>> GetKeyValueList(string nodeIdOrGuid, string propertyAlias, int uniqueFilter = 0, int allowNull = 0)
        {
            try
            {
                string[] usedUpLanguageCodes = Array.Empty<string>();
                try
                {
                    IPublishedContent currentNode = null;
                    if (int.TryParse(nodeIdOrGuid, out int nodeId) && nodeId > 0)
                    {
                        currentNode = _umbracoHelper.Content(nodeId);
                    }
                    else if (Guid.TryParse(nodeIdOrGuid, out Guid Key))
                    {
                        currentNode = _umbracoHelper.Content(Key);
                    }

                    if (currentNode != null)
                    {
                        var parent = currentNode?.Parent;
                        if (parent == null)
                        {
                            usedUpLanguageCodes = GetValuesOfChildrensProperty(currentNode, propertyAlias, nodeId).ToArray();
                        }
                        else
                        {
                            usedUpLanguageCodes = GetValuesOfChildrensProperty(parent, propertyAlias, nodeId).Union(GetValuesOfChildrensProperty(currentNode, propertyAlias, nodeId)).ToArray();
                        }
                    }
                    else
                    {
                        usedUpLanguageCodes = GetValuesOfChildrensProperty(null, propertyAlias, nodeId).ToArray();
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
            var nodes = node == null ? _umbracoHelper.ContentAtRoot() : node.Children;
            return nodes.Where(c => c.Id != nodeId).Select(c => c.Value<string>(propertyAlias)?.ToLowerInvariant());
        }
    }
}
