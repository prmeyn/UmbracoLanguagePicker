using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Services;

namespace UmbracoLanguagePicker
{
	public sealed class LanguageApiWrapper
	{
		private readonly ILanguageService _languageService;

		public LanguageApiWrapper(ILanguageService languageService)
		{
			_languageService = languageService;
		}

		public async Task<IEnumerable<LanguageDTO>> GetAllLanguagesAsync() => (await _languageService.GetAllAsync()).Select(l => new LanguageDTO() { ISOCode = l.IsoCode, EnglishName = l.CultureName });
	}
}
