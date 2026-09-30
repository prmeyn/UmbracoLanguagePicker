using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Extensions;

namespace UmbracoLanguagePicker
{
    [VersionedApiBackOfficeRoute("umbraco-language-picker")]
    [ApiExplorerSettings(GroupName = "UmbracoLanguagePicker")]
    public sealed class LanguageApiController : ManagementApiControllerBase
    {
        private readonly ILanguageService _languageService;
        private readonly IDocumentNavigationQueryService _navigationQueryService;
        private readonly IPublishedContentCache _publishedContentCache;
        private readonly ILogger<LanguageApiController> _logger;

        public LanguageApiController(ILanguageService languageService, IDocumentNavigationQueryService navigationQueryService, IPublishedContentCache publishedContentCache, ILogger<LanguageApiController> logger)
        {
            _languageService = languageService;
            _navigationQueryService = navigationQueryService;
            _publishedContentCache = publishedContentCache;
            _logger = logger;
        }

        [HttpGet("languages")]
        public async Task<IEnumerable<KeyValuePair<string, string>>> GetLanguages(string parentNodeIdOrGuid, string nodeIdOrGuid, string propertyAlias, bool uniqueFilter, bool allowNull)
        {
            try
            {
                string[] usedUpLanguageCodes = Array.Empty<string>();
                if (uniqueFilter)
                {
                    try
                    {
                        Guid? currentNodeKey = Guid.TryParse(nodeIdOrGuid, out Guid nodeKey) ? nodeKey : null;
                        // No parent means the node is at the content root
                        Guid? parentNodeKey = Guid.TryParse(parentNodeIdOrGuid, out Guid parentKey) ? parentKey : null;
                        usedUpLanguageCodes = (await GetValuesOfSiblingsProperty(parentNodeKey, propertyAlias, currentNodeKey)).ToArray();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Could not read sibling values for property {PropertyAlias} (node {NodeIdOrGuid}, parent {ParentNodeIdOrGuid}); showing all languages instead of applying the unique filter", propertyAlias, nodeIdOrGuid, parentNodeIdOrGuid);
                        uniqueFilter = false;
                    }
                }

                IEnumerable<LanguageDTO> languageList = await new LanguageApiWrapper(_languageService).GetAllLanguagesAsync();
                if (uniqueFilter)
                {
                    languageList = languageList.Where(c => !usedUpLanguageCodes.Contains(c.ISOCode.ToLowerInvariant()));
                }
                if (allowNull)
                {
                    languageList = languageList.Prepend(new LanguageDTO { ISOCode = "", EnglishName = "" });
                }
                return languageList.ToDictionary(c => c.ISOCode.ToLowerInvariant(), c => "").OrderBy(v => v.Key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not build the language list for property {PropertyAlias}", propertyAlias);
                throw;
            }
        }

        // Values of the property on the node's published siblings, not counting the node itself
        private async Task<IEnumerable<string>> GetValuesOfSiblingsProperty(Guid? parentNodeKey, string propertyAlias, Guid? currentNodeKey)
        {
            IEnumerable<Guid> siblingKeys;
            bool found = parentNodeKey.HasValue
                ? _navigationQueryService.TryGetChildrenKeys(parentNodeKey.Value, out siblingKeys)
                : _navigationQueryService.TryGetRootKeys(out siblingKeys);
            if (!found)
            {
                return Array.Empty<string>();
            }

            var values = new List<string>();
            foreach (Guid key in siblingKeys.Where(k => k != currentNodeKey))
            {
                // Returns null for nodes that aren't published
                var sibling = await _publishedContentCache.GetByIdAsync(key, preview: false);
                string value = sibling?.Value<string>(propertyAlias)?.ToLowerInvariant();
                if (value != null)
                {
                    values.Add(value);
                }
            }
            return values;
        }
    }
}
