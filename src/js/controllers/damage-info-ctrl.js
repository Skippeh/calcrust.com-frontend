angular.module("RustCalc").controller("DamageInfoCtrl", ["$scope", "$rootScope", "$rustData", "$q", "$http", DamageInfoCtrl]);

function DamageInfoCtrl ($scope, $rootScope, $rustData, $q, $http)
{
    $rootScope.page.titlePrefix = "Damage Info";
    $scope.loading = true;

    $rustData.requestDamageInfo(function(items, error)
    {
        $http({
            method: "GET",
            url: "https://api.calcrust.com/damages/" + items.map(function (item, i) { return encodeURIComponent(item.id); }).join("&")
        }).then(function(response)
        {
            $scope.loading = false;
            let damageInfos = response.data.data;

            for (let i = 0; i < damageInfos.length; ++i)
            {
                var damageInfo = damageInfos[i];

                if (!damageInfo.isBuildingBlock)
                {
                    damageInfo.item = $rustData.items[damageInfo.id];

                    if (damageInfo.item == null)
                    {
                        console.error("Unknown non building block item: " + damageInfo.id);
                    }

                    damageInfo.imageSrc = "/img/icons/" + damageInfo.id + "_small.png";
                    damageInfo.name = damageInfo.item.name;
                }
                else
                {
                    damageInfo.imageSrc = "/img/planner_" + damageInfo.id + ".png";
                    damageInfo.name = damageInfo.id; // Todo: Get actual building block name.
                }
            }
            
            console.log(damageInfos);
            $scope.damageInfos = damageInfos;
        }, function(error)
        {
            $scope.loading = false;
            console.log(error);
        });
    });
}