angular.module("RustCalc").controller("MasterCtrl", ["$scope", "$rustData", "$rootScope", "$stateParams", "$filter", "$state", "$location", MasterCtrl]);

function MasterCtrl ($scope, $rustData, $rootScope, $stateParams, $filter, $state, $location)
{
    $scope.stateParams = $stateParams;
    
    $rootScope.page = $scope.page =
    {
        loading: true,
        titlePrefix: null
    };

    $scope.isActive = function (stateName)
    {
        return $state.includes(stateName);
    };
    
    $rustData.load(function (data)
    {
        $scope.rustData = data;
        $rootScope.page.loading = false;
        window.RustData = angular.copy(data);
        $scope.lastUpdateText = moment($rustData.meta.lastUpdate).startOf("hour").calendar();

        $rootScope.$broadcast("rustDataLoaded");
    });

    // Send pageview to analytics on successful state change.
    $rootScope.$on("$stateChangeSuccess", function ()
    {
        ga('send', 'pageview', { page: $location.url() });
    });

    //var draggableOptions = {
    //    cursor: "default",
    //    x: false,
    //    y: true,
    //    slowdown: 0.925,
    //    threshold: 6
    //};
    //
    //var draggables = [];
    //draggables.push($(".item-browser > .browser-wrapper").kinetic(draggableOptions));
    //draggables.push($(".blueprint-browser > .browser-wrapper").kinetic(draggableOptions));
}