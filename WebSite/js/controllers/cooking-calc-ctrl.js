angular.module("RustCalc").controller("CookingCalcCtrl", ["$scope", "$rootScope", CookingCalcCtrl]);

function CookingCalcCtrl ($scope, $rootScope)
{
    $rootScope.page.titlePrefix = "Cooking/Smelting Calculator";
}