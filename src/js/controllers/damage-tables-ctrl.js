angular.module("RustCalc").controller("DamageTablesCtrl", ["$scope", "$rootScope", "$rustData", "$q", "$http", DamageTablesCtrl]);

function DamageTablesCtrl ($scope, $rootScope, $rustData, $q, $http)
{
    $rootScope.page.titlePrefix = "Damage Tables";
    $scope.loading = true;

    $rustData.requestDamageInfo(function(items, error)
    {
        $http({
            method: "GET",
            url: "https://api.calcrust.com/damages/" + items.map(function (item, i) { return encodeURIComponent(item.id); }).join("&")
        }).then(function(response)
        {
            $scope.loading = false;
            var damageInfos = response.data.data;
            
            console.log(damageInfos);
            $scope.damageInfos = damageInfos;
        }, function(error)
        {
            $scope.loading = false;
            console.log(error);
        });
    });
}