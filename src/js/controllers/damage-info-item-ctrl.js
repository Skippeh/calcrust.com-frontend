angular.module("RustCalc").controller("DamageInfoItemCtrl", ["$scope", "$rustData", "$http", "$stateParams", DamageInfoItemCtrl]);

function DamageInfoItemCtrl($scope, $rustData, $http, $stateParams)
{
	let itemId = $stateParams.id;
	let buildingGrade = $stateParams.grade;
	$scope.loading = true;

	$rustData.requestDestructible($stateParams.id, buildingGrade, function (data, error)
	{
		$scope.loading = false;

		if (error)
		{
			$scope.error = error;
			return;
		}

		console.log(data);
		$scope.data = data;
	});
}