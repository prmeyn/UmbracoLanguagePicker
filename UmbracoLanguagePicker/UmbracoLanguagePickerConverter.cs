using System;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;

namespace UmbracoLanguagePicker
{
	public class UmbracoLanguagePickerConverter : IPropertyValueConverter
	{
		public bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorAlias == "UmbracoLanguagePicker";
		public object ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object inter, bool preview) => inter as string;

		public object ConvertIntermediateToXPath(IPublishedElement owner, IPublishedPropertyType propertyType, PropertyCacheLevel referenceCacheLevel, object inter, bool preview)
		{
			throw new NotImplementedException();
		}

		public object ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object source, bool preview) => source as string;

		public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Element;
		public bool? IsValue(object value, PropertyValueLevel level) => !string.IsNullOrWhiteSpace(value as string);

		Type IPropertyValueConverter.GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(string);
	}
}
