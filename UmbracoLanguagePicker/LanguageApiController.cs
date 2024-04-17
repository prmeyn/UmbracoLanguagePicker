﻿using System;
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

        public override IOrderedEnumerable<KeyValuePair<string, string>> GetKeyValueList(string nodeIdOrGuid, string propertyAlias, int uniqueFilter = 0, int allowNull = 0)
        {
            try
            {
                
                LanguageDTO[] languageList = null;
                string[] usedUpLanguageCodes = Array.Empty<string>();
                if (uniqueFilter == 1)
                {
                    try
                    {
                        if (int.TryParse(nodeIdOrGuid, out int nodeId) && nodeId > 0)
                        {
                            var currentNode = _umbracoHelper.Content(nodeId);
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
                        else if (Guid.TryParse(nodeIdOrGuid, out Guid Key))
                        {
                            var currentNode = _umbracoHelper.Content(Key);
                            usedUpLanguageCodes = GetValuesOfChildrensProperty(currentNode?.Parent, propertyAlias, currentNode.Id).ToArray();
                        }
                        else
                        {
                            usedUpLanguageCodes = GetValuesOfChildrensProperty(null, propertyAlias, nodeId).ToArray();
                        }
                    }
                    catch { uniqueFilter = 0; }
                }
                languageList = uniqueFilter == 0 ? (new LanguageApiWrapper(_localizationService)).AllLanguages.ToArray() : (new LanguageApiWrapper(_localizationService)).AllLanguages.Where(c => !usedUpLanguageCodes.Contains(c.ISOCode.ToLowerInvariant())).ToArray();

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
