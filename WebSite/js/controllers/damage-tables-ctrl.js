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

            var buildingNames = Object.keys(damageInfos[items[0].id].damages)
                .filter(function(name)
                {
                    if (name.indexOf(":") !== -1)
                        return name.indexOf(":twigs") !== -1;

                    return true;
                })
                .map(function(name)
                {
                    var index = name.indexOf(":");

                    if (index != -1)
                        return name.substr(0, index);

                    return name;
                });
            console.log(buildingNames);
        }, function(error)
        {
            $scope.loading = false;
            console.log(error);
        });
    });
}