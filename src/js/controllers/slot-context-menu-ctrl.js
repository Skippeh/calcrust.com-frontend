angular.module("RustCalc").controller("SlotContextMenuCtrl", ["$scope", "$rustData", SlotContextMenuCtrl]);

function SlotContextMenuCtrl($scope, $rustData)
{
	$scope.parseCount = () => {
		$scope.slot.count = parseInt($scope.slot.count);
	};

	console.log($scope);
}