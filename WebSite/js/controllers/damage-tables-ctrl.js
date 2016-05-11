angular.module("RustCalc").controller("DamageTablesCtrl", ["$scope", "$rootScope", DamageTablesCtrl]);

function DamageTablesCtrl ($scope, $rootScope)
{
    $rootScope.page.titlePrefix = "Damage Tables";
}