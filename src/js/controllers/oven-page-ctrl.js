angular.module("RustCalc").controller("OvenPageCtrl", ["$scope", "$rustData", "$stateParams", OvenPageCtrl]);

function OvenPageCtrl($scope, $rustData, $stateParams)
{
	$scope.item = $rustData.items[$stateParams.id];
	$scope.slots = new Array($scope.item.meta.slots);

	if ($scope.item == null || $scope.item.meta == null || $scope.item.meta.type != "oven" || !$scope.item.meta.cookables.length)
	{
		$scope.item = null;
		return;
	}

	// Get all cookables that can be cooked using the current oven.
	$scope.cookables = $scope.item.meta.cookables;
}