angular.module("RustCalc").controller("ItemBPsController", ["$scope", "$rustData", "$rootScope", "$window", ItemBPsController]);

function ItemBPsController($scope, $rustData, $rootScope, $window)
{
    $rootScope.page.titlePrefix = "Items & Blueprints";

    $scope.items = Object.values($rustData.items);
    $scope.recipes = $rustData.recipes;

    $scope.categories = [{
        name: "all",
        items: $scope.items
    }].concat(_.map(_.groupBy($scope.items, "category"),
        (items, name) => ({ name, items })
    ));

    $scope.selectCategory = function(category)
    {
        $scope.selectedCategory = category;
    };

    $scope.selectCategory($scope.categories[0]);

    $scope.itemActive = function (item)
    {
        return $scope.stateParams.id === item.id;
    };

    $scope.scrollToTop = function (onlyBody)
    {
        if (!onlyBody)
            $(".item-browser .browser-wrapper").scrollTop(0);

        ($window.document.scrollingElement || $window.document.documentElement).scrollTop = 0;
    };
}