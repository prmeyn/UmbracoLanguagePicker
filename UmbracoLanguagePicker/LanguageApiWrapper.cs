using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Core.Services;

namespace UmbracoLanguagePicker
{
	public sealed class LanguageApiWrapper
	{
		private readonly ILocalizationService _localizationService;

		public LanguageApiWrapper(ILocalizationService localizationService)
		{
			_localizationService = localizationService;
		}

		public IEnumerable<LanguageDTO> AllLanguages => _localizationService.GetAllLanguages().Select(l => new LanguageDTO() { ISOCode = l.IsoCode, EnglishName = l.CultureName });
	}
}
