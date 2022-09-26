angular.module("umbraco").controller("UmbracoLanguagePickerController", function ($scope, $routeParams, $http, localizationService) {
	if (!$scope.model) {
		$scope.model = {};
	} 

	$scope.loadInProgress = true;
	$scope.displayValue = $scope.model.value;
	$scope.inEditState = !!$routeParams.create;

	var localizeList = [
		"UmbracoLanguagePicker_Edit"
		];
	$scope.translations = {};

	$scope.onEdit = function () {
		$scope.inEditState = true;
	}

	localizationService.localizeMany(localizeList).then(function (data) {
		for (var i = 0; i < localizeList.length; ++i) {
			$scope.translations[localizeList[i]] = data[i];
		}
	});
	$scope.model.list = {};
	$http.get("/umbraco/backoffice/UmbracoLanguagePicker/LanguageApi/GetKeyValueList?nodeId=" + $routeParams.id + "&propertyAlias=" + $scope.model.alias + "&uniqueFilter=" + ($scope.model.config.uniqueFilter || 0) + "&allowNull=" + ($scope.model.config.allowNull || 0)).then(function (response) {
		$scope.model.list = response.data;
		var valueFromList = _.find($scope.model.list, function (item) { return item.Key === $scope.model.value });
		if (valueFromList) { $scope.displayValue = valueFromList.Value };
		$scope.loadInProgress = false;
	}, function (err) {
		$scope.loadInProgress = false;
		});

	$scope.$on("formSubmitting", function (ev, args) {
		if (args.action === "save" || args.action === "publish") {
			$scope.inEditState = false;
		}
	});
});
