angular.module("RustCalc").controller("ItemBPsController", ["$scope", "$rustData", "$rootScope", ItemBPsController]);

function ItemBPsController($scope, $rustData, $rootScope)
{
    $rootScope.page.titlePrefix = "Items & Blueprints";

    $scope.items = Object.values($rustData.items);
    $scope.recipes = $rustData.recipes;

    $scope.itemActive = function (item)
    {
        return $scope.stateParams.id === item.id;
    };
}