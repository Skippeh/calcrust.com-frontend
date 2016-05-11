angular.module("RustCalc").controller("BugReportCtrl", ["$scope", "$rootScope", BugReportCtrl]);

function BugReportCtrl ($scope, $rootScope)
{
    $rootScope.page.titlePrefix = "Bugreport/Suggestions";

    $scope.getPageHeight = function ()
    {
        return window.innerHeight - 29; // 29 = footer height
    };
}