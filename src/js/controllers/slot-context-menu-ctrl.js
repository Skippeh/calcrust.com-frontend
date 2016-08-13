angular.module("RustCalc").controller("SlotContextMenuCtrl", ["$scope", "$rustData", "$element", "$timeout", SlotContextMenuCtrl]);

function SlotContextMenuCtrl($scope, $rustData, $element, $timeout)
{
	$scope.fuel = $scope.item.meta.oven.fuelType;

	$scope.clampCount = () => {
		if ($scope.slot.count < 1)
			$scope.slot.count = 1;

		if ($scope.slot.count > $scope.slot.item.maxStack)
			$scope.slot.count = $scope.slot.item.maxStack;
	};

	$scope.getRounding = count => {
		if (count >= 1000)
			return 25;

		if (count >= 100)
			return 10;

		return 1;
	};

	$scope.addItem = (item, count) => {
		$scope.addToSlots(1, { item: item, count: count }, false, $scope.slot.index);
		$scope.calculate();

		$timeout(() => {
			$element.scrollTop(0);
		});
	};
}