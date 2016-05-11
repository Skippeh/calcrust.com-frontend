angular.module("RustCalc").controller("ItemRecipesPageCtrl", ["$scope", "$rustData", ItemRecipesPageCtrl]);

function ItemRecipesPageCtrl ($scope, $rustData)
{
    $scope.reqs = $scope.item.getRecipesWhereInput();
}