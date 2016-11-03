angular.module("RustCalc").controller("DamageInfoCtrl", ["$scope", "$rootScope", "$rustData", "$q", "$http", DamageInfoCtrl]);

function DamageInfoCtrl ($scope, $rootScope, $rustData, $q, $http)
{
    $rootScope.page.titlePrefix = "Damage Info";
    $scope.loading = true;

    $rustData.requestDamageInfoItems(function(damageInfos, error)
    {
        $scope.loading = false;

        if (error)
        {
            console.log(error);
            return;
        }

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
            }
            else
            {
                damageInfo.imageSrc = "/img/planner_" + damageInfo.id + ".png";
            }
         }
            
        console.log(damageInfos);
        $scope.damageInfos = damageInfos;
    });
}