angular.module("RustCalc").controller("DamageInfoItemCtrl", ["$scope", "$rustData", "$http", "$stateParams", DamageInfoItemCtrl]);

function DamageInfoItemCtrl($scope, $rustData, $http, $stateParams)
{
	let itemId = $stateParams.id;
	let buildingGrade = $stateParams.grade;
	$scope.loading = true;
	$scope.isBuildingBlock = buildingGrade != undefined;

	console.log("building block? " + $scope.isBuildingBlock);

	$rustData.requestDamageInfo($stateParams.id + ($scope.isBuildingBlock ? ":" + buildingGrade : ""), function (data, error)
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