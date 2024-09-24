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
        public override IOrderedEnumerable<KeyValuePair<string, string>> GetKeyValueList(string parentNodeIdOrGuid, string nodeIdOrGuid, string propertyAlias, int uniqueFilter = 0, int allowNull = 0)
        {
            try
            {
                string[] usedUpLanguageCodes = Array.Empty<string>();
                try
                {
                    // Current node block
                    IPublishedContent currentNode = null;
                    if (int.TryParse(nodeIdOrGuid, out int nodeId) && nodeId > 0)
                    {
                        currentNode = _umbracoHelper.Content(nodeId);
                    }
                    else if (Guid.TryParse(nodeIdOrGuid, out Guid Key))
                    {
                        currentNode = _umbracoHelper.Content(Key);
                    }
                    
                    // Parent node block
                    IPublishedContent parentNode = null;
                    if (int.TryParse(parentNodeIdOrGuid, out int parentNodeId) && parentNodeId > 0)
                    {
                        parentNode = _umbracoHelper.Content(parentNodeId);
                    }
                    else if (Guid.TryParse(parentNodeIdOrGuid, out Guid Key))
                    {
                        parentNode = _umbracoHelper.Content(Key);
                    }
                    usedUpLanguageCodes = GetValuesOfChildrensProperty(parentNode, propertyAlias, currentNode?.Id).ToArray();
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
                    languageList = languageList.Prepend(new LanguageDTO { ISOCode = "", EnglishName = "" }).ToArray();
                }
                return languageList.ToDictionary(c => c.ISOCode.ToLowerInvariant(), c => "").OrderBy(v => v.Key);
            }
            catch
            {
                return null;
            }
        }

        private IEnumerable<string> GetValuesOfChildrensProperty(IPublishedContent parentNode, string propertyAlias, int? currentNodeId)
        {
            var nodes = parentNode == null ? _umbracoHelper.ContentAtRoot() : parentNode.Children;
            return nodes.Where(c => c.Id != currentNodeId).Select(c => c.Value<string>(propertyAlias)?.ToLowerInvariant());
        }
    }
}
