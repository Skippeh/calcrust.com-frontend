angular.module("RustCalc").controller("ItemRecipePageCtrl", ["$scope", "$rustData", "$stateParams", BlueprintPageCtrl]);

function BlueprintPageCtrl ($scope, $rustData, $stateParams)
{
    $scope.recipe = $rustData.recipes[$stateParams.id.toLowerCase()];
}