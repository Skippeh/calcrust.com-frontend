angular.module("RustCalc").controller("ItemBPsController", ["$scope", "$rustData", "$rootScope", "$stateParams", ItemBPsController]);

function ItemBPsController($scope, $rustData, $rootScope, $stateParams)
{
    $rootScope.page.titlePrefix = "Items & Blueprints";

    $scope.items = Object.values($rustData.items);
    $scope.recipes = $rustData.recipes;

    $scope.itemActive = function (item)
    {
        return $stateParams.id === item.id;
    };
}