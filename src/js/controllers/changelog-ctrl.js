angular.module("RustCalc").controller("ChangelogCtrl", ["$scope", ChangelogCtrl]);

function ChangelogCtrl($scope)
{
	$scope.getDate = (date) => {
		return $scope.dateString = moment(date, "YYYYMMDD").format("LL");
	};
}